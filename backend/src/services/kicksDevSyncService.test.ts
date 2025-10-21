import { syncLabubuValues } from "./kicksDevSyncService";
import { labubuRepository } from "../index"; // Assuming labubuRepository is exported from index.ts
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock labubuRepository
jest.mock("../index", () => ({
  labubuRepository: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

const mockedLabubuRepository = labubuRepository as jest.Mocked<typeof labubuRepository>;

describe("syncLabubuValues", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log and console.error to prevent clutter during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should fetch Labubu values and update lowestPrice", async () => {
    // Sample Labubu data
    const mockLabubus = [
      { id: 1, sku: "LBB-EXM-SM", name: "Soy Milk", series: "Exciting Macaron (V1)", lowestPrice: undefined },
      { id: 2, sku: "LBB-HAS-DA", name: "Dada", series: "Have a Seat (V2)", lowestPrice: undefined },
    ];

    // Sample Kicks.dev API response
    const mockApiResponse = {
      data: [
        {
          variants: [{ lowest_ask: 100 }],
        },
      ],
    };

    mockedLabubuRepository.get.mockResolvedValue(mockLabubus);
    mockedAxios.get.mockResolvedValue({ data: mockApiResponse });

    await syncLabubuValues();

    // Expect labubuRepository.get to be called once
    expect(mockedLabubuRepository.get).toHaveBeenCalledTimes(1);

    // Expect axios.get to be called for each Labubu
    expect(mockedAxios.get).toHaveBeenCalledTimes(mockLabubus.length);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.kicks.dev/v3/stockx/products",
      expect.objectContaining({
        params: { query: "Soy Milk", "display[variants]": true },
      })
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.kicks.dev/v3/stockx/products",
      expect.objectContaining({
        params: { query: "Dada", "display[variants]": true },
      })
    );

    // Expect labubuRepository.update to be called for each Labubu with the correct lowestPrice
    expect(mockedLabubuRepository.update).toHaveBeenCalledTimes(mockLabubus.length);
    expect(mockedLabubuRepository.update).toHaveBeenCalledWith(
      { filter: { sku: "LBB-EXM-SM" } },
      { lowestPrice: 100 }
    );
    expect(mockedLabubuRepository.update).toHaveBeenCalledWith(
      { filter: { sku: "LBB-HAS-DA" } },
      { lowestPrice: 100 }
    );
  });

  it("should handle cases where no lowest ask is found", async () => {
    const mockLabubus = [
      { id: 1, sku: "LBB-EXM-SM", name: "Soy Milk", series: "Exciting Macaron (V1)", lowestPrice: undefined },
    ];

    const mockApiResponseNoLowestAsk = {
      data: [
        {
          variants: [], // No variants, or no lowest_ask
        },
      ],
    };

    mockedLabubuRepository.get.mockResolvedValue(mockLabubus);
    mockedAxios.get.mockResolvedValue({ data: mockApiResponseNoLowestAsk });

    await syncLabubuValues();

    expect(mockedLabubuRepository.update).not.toHaveBeenCalled(); // Should not update if no lowest ask
  });

  it("should handle API errors gracefully", async () => {
    const mockLabubus = [
      { id: 1, sku: "LBB-EXM-SM", name: "Soy Milk", series: "Exciting Macaron (V1)", lowestPrice: undefined },
    ];

    mockedLabubuRepository.get.mockResolvedValue(mockLabubus);
    mockedAxios.get.mockRejectedValue(new Error("API Error"));

    await syncLabubuValues();

    expect(mockedLabubuRepository.update).not.toHaveBeenCalled(); // Should not update on API error
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error fetching data for Labubu Soy Milk (SKU: LBB-EXM-SM) from Kicks.dev API:"),
      expect.any(Error)
    );
  });
});