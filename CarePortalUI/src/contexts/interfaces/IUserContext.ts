import { UserDto, CreateUserDto, UpdateUserDto } from '../../services/userService';

export interface IUserContext {
  users: UserDto[];
  usersTotalCount: number;
  loading: boolean;
  error: string | null;
  
  // User operations
  addUser: (user: CreateUserDto) => Promise<void>;
  updateUser: (id: string, user: UpdateUserDto) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  refreshUsers: (search?: string) => Promise<void>;
  
  // Error handling
  clearError: () => void;
} 