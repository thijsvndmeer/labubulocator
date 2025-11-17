import { ContentRepository } from "../repositories/contentRepository";
import { Content, QueryOptions } from "../../../common/src/index";

export class ContentService {
  private contentRepository: ContentRepository;

  constructor(contentRepository: ContentRepository) {
    this.contentRepository = contentRepository;
  }

  async createContent(content: Omit<Content, "id">): Promise<number> {
    console.log(`CONTENT_SERVICE: Creating content with key: ${content.key}`);
    return this.contentRepository.createContent({ ...content, last_updated: new Date().toISOString() });
  }

  async getContent(options?: QueryOptions<Content>): Promise<Content[]> {
    console.log("CONTENT_SERVICE: Fetching content.");
    return this.contentRepository.getContent(options);
  }

  async getContentByKey(key: string): Promise<Content | undefined> {
    console.log(`CONTENT_SERVICE: Fetching content by key: ${key}`);
    const contents = await this.contentRepository.getContent({ filter: { key } });
    return contents[0];
  }

  async updateContent(id: number, data: Partial<Omit<Content, "id">>): Promise<number> {
    console.log(`CONTENT_SERVICE: Updating content with ID: ${id}`);
    return this.contentRepository.updateContent({ filter: { id } }, { ...data, last_updated: new Date().toISOString() });
  }

  async deleteContent(id: number): Promise<number> {
    console.log(`CONTENT_SERVICE: Deleting content with ID: ${id}`);
    return this.contentRepository.deleteContent({ filter: { id } });
  }
}