import { Prisma } from "@prisma/client";
import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  intArg,
  inputObjectType,
  enumType,
  arg,
  list,
} from "nexus";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.nonNull.dateTime("createdAt");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .voters();
      },
    });
  },
});

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link });
    t.nonNull.int("count");
    t.id("id");
  },
});

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
      },
      async resolve(parent, args, context, info) {
        const where = args.filter
          ? {
              OR: [
                { description: { contains: args.filter } },
                { url: { contains: args.filter } },
              ],
            }
          : {};
        const links = await context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined,
        });

        const count = await context.prisma.link.count({ where });
        const id = `main-feed:${JSON.stringify(args)}`;

        return { links, count, id };
      },
    });

    t.field("link", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
      },
      resolve(parent, args, context, info) {
        const { id } = args;
        return context.prisma.link.findUnique({
          where: { id },
        });
      },
    });

    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { description, url } = args;

        const newLink = context.prisma.link.create({
          data: {
            url,
            description,
          },
        });

        return newLink;
      },
    });
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { description, url } = args;
        const { userId } = context;

        if (!userId) {
          throw new Error("Cannot post without logging in");
        }

        const newLink = context.prisma.link.create({
          data: {
            url,
            description,
            postedBy: { connect: { id: userId } },
          },
        });

        return newLink;
      },
    });

    t.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { id, url, description } = args;

        return context.prisma.link.update({
          where: { id },
          data: {
            url,
            description,
          },
        });
      },
    });

    t.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
      },

      resolve(parent, args, context) {
        const { id } = args;

        return context.prisma.link.delete({
          where: { id },
        });
      },
    });
  },
});
