import DBSetup from "./initialConnection";

class DB {
  static query = async (query: string, values?: Array<any>) => {
    const client = await DBSetup.getPool().connect();
    const result = await client.query(query, values);
    client.release();
    return result;
  };
}

export default DB;
