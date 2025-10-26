import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { signinInput, signupInput } from "@gautamambedkar/medium-common"

export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	}
}>();

userRouter.post('/signup', async (c) => {
	const body = await c.req.json();
	const { success } = signupInput.safeParse(body);
	if (!success) {
		c.status(411);
		return c.json({
			message: "inputs not correct",
		});
	}

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		// Normalize email before saving
		const normalizedEmail = body.username.toLowerCase();

		const user = await prisma.user.create({
			data: {
				username: normalizedEmail,
				password: body.password,
				name: body.name,
			},
		});

		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.text(jwt);
	} catch (e) {
		c.status(400); // better than 411
		return c.json({ message: "User already exists with this email" });
	}

});


userRouter.post('/signin', async (c) => {
	const body = await c.req.json()
	const { success } = signinInput.safeParse(body);
	if (!success) {
		c.status(411);
		return c.json({
			message: "inputs not correct"
		})
	}
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate())

	try {
		const user = await prisma.user.findFirst({
			where: {
				username: body.username,
				password: body.password
			}
		})
		if (!user) {
			c.status(403)
			return c.json({ message: "incorrect creds" })
		}
		const jwt = await sign({
			id: user.id
		}, c.env.JWT_SECRET)

		return c.text(jwt)
	} catch (e) {
		c.status(411)
		return c.text("invalid")
	}
})

userRouter.post('/update-profile', async (c) => {
	const authHeader = c.req.header("authorization") || "";
	if (!authHeader) {
		c.status(401);
		return c.json({ message: "No token provided" });
	}

	try {
		const token = authHeader.replace("Bearer ", "");
		const decoded = await verify(token, c.env.JWT_SECRET) as { id: number };
		const userId = decoded.id;

		const { profilePic, name } = await c.req.json<{
			profilePic?: string;
			name?: string;
		}>();

		if (!profilePic && !name) {
			c.status(400);
			return c.json({ message: "Nothing to update" });
		}

		const prisma = new PrismaClient({
			datasourceUrl: c.env.DATABASE_URL,
		}).$extends(withAccelerate());

		const updateData: any = {};
		if (profilePic) updateData.profilePic = profilePic;
		if (name) updateData.name = name; // ✅ update name instead of username

		await prisma.user.update({
			where: { id: userId },
			data: updateData,
		});

		return c.json({ message: "Profile updated successfully" });
	} catch (err) {
		console.error(err);
		c.status(403);
		return c.json({ message: "Invalid token or request" });
	}
});


userRouter.get('/me', async (c) => {
	const authHeader = c.req.header("authorization") || "";
	if (!authHeader) {
		c.status(401);
		return c.json({ message: "No token provided" });
	}

	try {
		// ✅ Support Bearer format
		const token = authHeader.replace("Bearer ", "");
		const decoded = await verify(token, c.env.JWT_SECRET) as { id: number };
		const userId = decoded.id;

		const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, name: true, username: true, profilePic: true }
		});

		return c.json({ user });
	} catch (err) {
		console.error(err);
		c.status(403);
		return c.json({ message: "Invalid token or request" });
	}
});
