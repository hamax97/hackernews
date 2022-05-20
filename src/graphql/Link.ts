import { objectType, extendType, nonNull, stringArg, intArg } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

let links: NexusGenObjects["Link"][] = [
  {
    id: 1,
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
  {
    id: 2,
    url: "graphql.org",
    description: "GraphQL official website",
  },
];

export const LinkQueryFeed = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return links;
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
        return links.find((l) => l.id === id) || null;
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

        let idCount = links.length + 1;
        const link = {
          id: idCount,
          description: description,
          url: url,
        };
        links.push(link);
        return link;
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

        for (let i = 0; i < links.length; i++) {
          const toUpdate = links[i];
          if (toUpdate.id === id) {
            return Object.assign(links[i], { url, description });
          }
        }

        return null;
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

        for (let i = 0; i < links.length; i++) {
          const toDelete = links[i];
          if (toDelete.id === id) {
            return links.splice(i, 1)[0];
          }
        }

        return null;
      },
    });
  },
});
