import { RoleRepository } from "../repositories/roleRepository";
import { Role, QueryOptions } from "../../../common/src/index";

export class RoleService {
  private roleRepository: RoleRepository;

  constructor(roleRepository: RoleRepository) {
    this.roleRepository = roleRepository;
  }

  async createRole(role: Omit<Role, "id">): Promise<number> {
    // Add any business logic/validation before creating a role
    console.log(`ROLE_SERVICE: Creating role with name: ${role.name}`);
    return this.roleRepository.createRole(role);
  }

  async getRoles(options?: QueryOptions<Role>): Promise<Role[]> {
    console.log("ROLE_SERVICE: Fetching roles.");
    return this.roleRepository.getRoles(options);
  }

  async getRoleById(id: number): Promise<Role | undefined> {
    console.log(`ROLE_SERVICE: Fetching role by ID: ${id}`);
    const roles = await this.roleRepository.getRoles({ filter: { id } });
    return roles[0];
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    console.log(`ROLE_SERVICE: Fetching role by name: ${name}`);
    const roles = await this.roleRepository.getRoles({ filter: { name } });
    return roles[0];
  }

  async updateRole(id: number, data: Partial<Omit<Role, "id">>): Promise<number> {
    // Add any business logic/validation before updating a role
    console.log(`ROLE_SERVICE: Updating role with ID: ${id}`);
    return this.roleRepository.updateRole({ filter: { id } }, data);
  }

  async deleteRole(id: number): Promise<number> {
    // Add any business logic/validation before deleting a role
    console.log(`ROLE_SERVICE: Deleting role with ID: ${id}`);
    return this.roleRepository.deleteRole({ filter: { id } });
  }
}
