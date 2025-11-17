import { UserRepository } from "../repositories/userRepository";
import { User, QueryOptions } from "../../../common/src/index";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(user: Omit<User, "id">): Promise<number> {
    // Add any business logic/validation before creating a user
    console.log(`USER_SERVICE: Creating user with username: ${user.username}`);
    return this.userRepository.createUser(user);
  }

  async getUsers(options?: QueryOptions<User>): Promise<User[]> {
    console.log("USER_SERVICE: Fetching users.");
    return this.userRepository.getUsers(options);
  }

  async getUserById(id: number): Promise<User | undefined> {
    console.log(`USER_SERVICE: Fetching user by ID: ${id}`);
    const users = await this.userRepository.getUsers({ filter: { id } });
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`USER_SERVICE: Fetching user by username: ${username}`);
    const users = await this.userRepository.getUsers({ filter: { username } });
    return users[0];
  }

  async updateUser(id: number, data: Partial<Omit<User, "id">>): Promise<number> {
    // Add any business logic/validation before updating a user
    console.log(`USER_SERVICE: Updating user with ID: ${id}`);
    return this.userRepository.updateUser({ filter: { id } }, data);
  }

  async deleteUser(id: number): Promise<number> {
    // Add any business logic/validation before deleting a user
    console.log(`USER_SERVICE: Deleting user with ID: ${id}`);
    return this.userRepository.deleteUser({ filter: { id } });
  }
}
