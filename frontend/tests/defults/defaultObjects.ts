interface DefaultObjects {
  survey: {
    id: string
    title: string
  }, 
  user: {
    email: string,
    password: string,
  },
  defaultTimeout: number,

}

// this defult based on data seed and can be used in tests against PR enviroments. 
// for different enviroments we can add more objects 
export const defaultObjects: DefaultObjects = {
  survey: {
    id: 'default-survey-id',
    title: 'Demo Survey',
  },
  user: {
    email: 'kek@lol.com',
    password: 'Test@1234',
  },
  defaultTimeout: 5000,
}

