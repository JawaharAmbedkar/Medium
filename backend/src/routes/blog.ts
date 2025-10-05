import { Prisma, PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@gautamambedkar/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    userId: string;
  }
}>();


blogRouter.get('/all', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        coverImage: true,
        authorId: true,
        author: {
          select: {
            name: true,
            profilePic: true,
          },
        },
      },
    });

    return c.json({ blogs });
  } catch (err) {
    console.error(err);
    c.status(500);
    return c.json({ message: "Error fetching blogs" });
  }
});

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";

  if (!authHeader) {
    c.status(403);
    return c.json({ message: "You are not logged in" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const user = await verify(token, c.env.JWT_SECRET);
    if (user) {
      // @ts-ignore
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({ message: "You are not logged in" });
    }
  } catch (e) {
    c.status(403);
    return c.json({ message: "You are not logged in" });
  }
});

blogRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "inputs not correct" });
  }
  const authorId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      content: body.content,
      coverImage: body.coverImage,
      authorId: Number(authorId),
    }
  });
  return c.json({ id: blog.id });
});

blogRouter.put('/', async (c) => {
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "inputs not correct" });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.blog.update({
    where: { id: body.id },
    data: {
      title: body.title,
      content: body.content,
      coverImage: body.coverImage
    }
  });

  return c.json({ id: blog.id });
});


blogRouter.get("/bulk", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ message: "You are not logged in" }, { status: 403 });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.blog.findMany({
      where: { authorId: Number(userId) },
      orderBy: { id: "desc" },
      select: {
        content: true,
        title: true,
        id: true,
        coverImage: true,
        authorId: true,
        author: {
          select: {
            name: true,
            profilePic: true,
          },
        },
      },
    });

    return c.json({ blogs });
  } catch (err) {
    console.error(err);
    return c.json({ message: "Failed to fetch blogs" }, { status: 500 });
  }
});

blogRouter.get("/:id", async (c) => {
  const idParam = c.req.param("id");
  const blogId = Number(idParam);
  if (isNaN(blogId)) {
    return c.json({ message: "Invalid blog ID" }, { status: 400 });
  }

  const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: {
      id: true,
      title: true,
      content: true,
      coverImage: true,
      authorId: true,
      author: { select: { name: true, profilePic: true } },
    },
  });

  if (!blog) return c.json({ message: "Blog not found" }, { status: 404 });
  return c.json({ blog });
});

blogRouter.delete('/:id', async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId");

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const existing = await prisma.blog.findUnique({
      where: { id: Number(id) },
      select: { authorId: true }
    });

    if (!existing) {
      c.status(404);
      return c.json({ message: "Blog not found" });
    }

    if (existing.authorId !== Number(userId)) {
      c.status(403);
      return c.json({ message: "Not allowed to delete this blog" });
    }

    await prisma.blog.delete({
      where: { id: Number(id) }
    });

    return c.json({ message: "Blog deleted successfully" });

  } catch (err) {
    c.status(500);
    return c.json({ message: "Error deleting blog" });
  }
});
