// Map of service → env var name. Add new services here.
// register the services urls
// export const Url = z.url();
export const SERVICES: Record<string, string | undefined> = {
    backend: process.env.BACKEND_URL,
    //   register backend URLs here
    //   every service will allow client to call it via /api/proxy/{service}/...{rest_of_path}
    // example  surveys: process.env.SURVEYS_URL,
};

