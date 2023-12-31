const {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand,
  } = require('@aws-sdk/client-dynamodb');
  const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
  
  const client = new DynamoDBClient();
  
  const getEmployee = async (event) => {
    const response = { statusCode: 200 };
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ postId: event.pathParameters.postId }),
      };
      const { Item } = await client.send(new GetItemCommand(params));
      response.body = JSON.stringify({
        message: 'Successfully retrieved post.',
        data: Item ? unmarshall(Item) : {},
        rawData: Item,
      });
    } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to get post.',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
    return response;
  };
  
  const createEmployee = async (event) => {
    const response = { statusCode: 200 };
    try {
      const body = JSON.parse(event.body);
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: marshall(body || {}),
      };
      const createResult = await client.send(new PutItemCommand(params));
      response.body = JSON.stringify({
        message: 'Successfully created post.',
        createResult,
      });
    } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to create post.',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
    return response;
  };
  
  const updateEmployee = async (event) => {
    const response = { statusCode: 200 };
    try {
      const body = JSON.parse(event.body);
      const objKeys = Object.keys(body);
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ postId: event.pathParameters.postId }),
        UpdateExpression: `SET ${objKeys
          .map((_, index) => `#key${index} = :value${index}`)
          .join(', ')}`,
        ExpressionAttributeNames: objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`#key${index}`]: key,
          }),
          {}
        ),
        ExpressionAttributeValues: marshall(
          objKeys.reduce(
            (acc, key, index) => ({
              ...acc,
              [`:value${index}`]: body[key],
            }),
            {}
          )
        ),
      };
      const updateResult = await client.send(new UpdateItemCommand(params));
      response.body = JSON.stringify({
        message: 'Successfully updated post.',
        updateResult,
      });
    } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to update post.',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
    return response;
  };
  
  const deleteEmployee = async (event) => {
    const response = { statusCode: 200 };
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ postId: event.pathParameters.postId }),
      };
      const deleteResult = await client.send(new DeleteItemCommand(params));
      response.body = JSON.stringify({
        message: 'Successfully deleted post.',
        deleteResult,
      });
    } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to delete post.',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
    return response;
  };
  
  const getAllEmployees = async () => {
    const response = { statusCode: 200 };
    try {
      const { Items } = await client.send(
        new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
      );
      response.body = JSON.stringify({
        message: 'Successfully retrieved all posts.',
        data: Items.map((item) => unmarshall(item)),
        Items,
      });
    } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to retrieve posts.',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
    return response;
  };
  
  module.exports = {
    getPost,
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
  };