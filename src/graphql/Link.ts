import { objectType, extendType, nonNull, stringArg, intArg } from "nexus";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

export const LinkQueryFeed = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return context.prisma.link.findMany();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
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
  },
});

export const LinkMutationPost = extendType({
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

export const LinkMutationUpdate = extendType({
  type: "Mutation",
  definition(t) {
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
  },
});

export const LinkMutationDelete = extendType({
  type: "Mutation",
  definition(t) {
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
