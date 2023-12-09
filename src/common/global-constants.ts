export interface ITokenData {
  email: string;
  user_id: string;
  created_by: string;
}
export const USER = {
    AlREADY:"user already created",
    CREATED:"user created successfully",
  NOT_FOUND: 'user not found',
  PASSWORD: 'password does not match please try again',
  SUCCESS: 'user successfully',
};

export const ERROR = {
  INTERNAL_SERVER_ERROR: 'something went wrong',
};
