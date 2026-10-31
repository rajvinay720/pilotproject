// Centralized GraphQL operations avoid duplicated query strings in tests.
export const SHOP = /* GraphQL */ `
  query ShopDetails {
    shop { name }
  }
`;
export const PRODUCTS = /* GraphQL */ `
  query ProductPage($channel: String!, $first: Int!, $after: String) {
    products(channel: $channel, first: $first, after: $after) {
      edges { cursor node { id name slug } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
