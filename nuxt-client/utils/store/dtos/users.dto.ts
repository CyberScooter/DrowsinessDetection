export class UserDTO {
  username: string;
  password: string;
  email?: string;
}

export class UserResponseDTO {
  data?: object;
  error?: string;
}
