export const GET_IMAGE = `query {
    files(first: 100) {
      edges {
        node {
            createdAt
          ... on MediaImage {
            id
            originalSource{
                fileSize
            }
            image {
              id
              originalSrc: url
              width
              height
            }
          }
        }
      }
    }
  }       
  `;
export const POST_IMAGE = `
  mutation fileCreate($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files {
      alt
      createdAt
    }
  }
}
`;
