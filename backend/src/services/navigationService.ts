import { NavigationRepository } from "../repositories/navigationRepository";
import { Navigation, QueryOptions } from "../../../common/src/index";

export class NavigationService {
  private navigationRepository: NavigationRepository;

  constructor(navigationRepository: NavigationRepository) {
    this.navigationRepository = navigationRepository;
  }

  async createNavigation(navigation: Omit<Navigation, "id">): Promise<number> {
    console.log(`NAVIGATION_SERVICE: Creating navigation with name: ${navigation.name}`);
    return this.navigationRepository.createNavigation({ ...navigation, last_updated: new Date().toISOString() });
  }

  async getNavigation(options?: QueryOptions<Navigation>): Promise<Navigation[]> {
    console.log("NAVIGATION_SERVICE: Fetching navigation entries.");
    return this.navigationRepository.getNavigation(options);
  }

  async getNavigationById(id: number): Promise<Navigation | undefined> {
    console.log(`NAVIGATION_SERVICE: Fetching navigation by ID: ${id}`);
    const navigations = await this.navigationRepository.getNavigation({ filter: { id } });
    return navigations[0];
  }

  async getNavigationByName(name: string): Promise<Navigation | undefined> {
    console.log(`NAVIGATION_SERVICE: Fetching navigation by name: ${name}`);
    const navigations = await this.navigationRepository.getNavigation({ filter: { name } });
    return navigations[0];
  }

  async updateNavigation(id: number, data: Partial<Omit<Navigation, "id">>): Promise<number> {
    console.log(`NAVIGATION_SERVICE: Updating navigation with ID: ${id}`);
    return this.navigationRepository.updateNavigation({ filter: { id } }, { ...data, last_updated: new Date().toISOString() });
  }

  async deleteNavigation(id: number): Promise<number> {
    console.log(`NAVIGATION_SERVICE: Deleting navigation with ID: ${id}`);
    return this.navigationRepository.deleteNavigation({ filter: { id } });
  }
}
