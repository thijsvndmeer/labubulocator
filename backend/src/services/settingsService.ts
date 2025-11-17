import { SettingsRepository } from "../repositories/settingsRepository";
import { Settings, QueryOptions } from "@labubu/common";

export class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor(settingsRepository: SettingsRepository) {
    this.settingsRepository = settingsRepository;
  }

  async createSetting(setting: Omit<Settings, "id">): Promise<number> {
    console.log(`SETTINGS_SERVICE: Creating setting with key: ${setting.key}`);
    return this.settingsRepository.createSetting({ ...setting, last_updated: new Date().toISOString() });
  }

  async getSettings(options?: QueryOptions<Settings>): Promise<Settings[]> {
    console.log("SETTINGS_SERVICE: Fetching settings entries.");
    return this.settingsRepository.getSettings(options);
  }

  async getSettingById(id: number): Promise<Settings | undefined> {
    console.log(`SETTINGS_SERVICE: Fetching setting by ID: ${id}`);
    const settings = await this.settingsRepository.getSettings({ filter: { id } });
    return settings[0];
  }

  async getSettingByKey(key: string): Promise<Settings | undefined> {
    console.log(`SETTINGS_SERVICE: Fetching setting by key: ${key}`);
    const settings = await this.settingsRepository.getSettings({ filter: { key } });
    return settings[0];
  }

  async updateSetting(id: number, data: Partial<Omit<Settings, "id">>): Promise<number> {
    console.log(`SETTINGS_SERVICE: Updating setting with ID: ${id}`);
    return this.settingsRepository.updateSetting({ filter: { id } }, { ...data, last_updated: new Date().toISOString() });
  }

  async deleteSetting(id: number): Promise<number> {
    console.log(`SETTINGS_SERVICE: Deleting setting with ID: ${id}`);
    return this.settingsRepository.deleteSetting({ filter: { id } });
  }
}
