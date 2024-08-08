import { CREATE_FILE_MUTATION, DELETE_FILE_MUTATION } from "./graphql.js";

export const createFiles = async (client, variables) => {
    const response = await client.query({
        data: {
          query: CREATE_FILE_MUTATION,
          variables: variables
        }
    });

    return response.body.data.fileCreate;
};


export const deleteFiles = async (files, client) => {
    const variables = { fileIds: files };
    const response = await client.query({
        data: {
          query: DELETE_FILE_MUTATION,
          variables: variables
        }
    });

    return response.body.data.fileDelete;
};


export const uploadImages = async (files, client) => {
    const filesInput = [];
    files.forEach((file) => {
        const contentType = file.file?.mimetype.indexOf("image") !== -1 ? "IMAGE" : "FILE";
        filesInput.push({
          alt: file.file?.name || "",
          contentType: contentType,
          originalSource: process.env.HOST + "/files/" + file.name,
        });
    });

    const variables = { files: filesInput };

    const uploadFiles = await createFiles(client, variables);

    return uploadFiles;
};