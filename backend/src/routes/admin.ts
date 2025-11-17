import express from "express";
import { labubuRepository, userService, roleService, contentService, navigationService, settingsService } from "../index";
import { labubuSchema, userSchema, roleSchema, contentSchema, navigationSchema, settingsSchema } from "../../../common/src/index";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ msg: "Welcome to the admin area" });
});

//============================================================================================================================================================================================
// Labubu Routes
//============================================================================================================================================================================================

router.post("/labubus", async (req, res) => {
  console.log("ROUTE: POST /api/admin/labubus - Request received.");
  try {
    const labubu = labubuSchema.parse(req.body);
    const newLabubu = await labubuRepository.create(labubu);
    console.log("ROUTE: POST /api/admin/labubus - Created new labubu:", newLabubu);
    res.status(201).json(newLabubu);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while creating the labubu.", details: err });
  }
});

router.put("/labubus/:sku", async (req, res) => {
  console.log(`ROUTE: PUT /api/admin/labubus/${req.params.sku} - Request received.`);
  try {
    const labubu = labubuSchema.parse(req.body);
    const updatedLabubu = await labubuRepository.update({ filter: { sku: req.params.sku } }, labubu);
    console.log(`ROUTE: PUT /api/admin/labubus/${req.params.sku} - Updated labubu:`, updatedLabubu);
    res.status(200).json(updatedLabubu);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating the labubu.", details: err });
  }
});

router.delete("/labubus/:sku", async (req, res) => {
  console.log(`ROUTE: DELETE /api/admin/labubus/${req.params.sku} - Request received.`);
  try {
    const deletedCount = await labubuRepository.delete({ filter: { sku: req.params.sku } });
    if (deletedCount > 0) {
      console.log(`ROUTE: DELETE /api/admin/labubus/${req.params.sku} - Deleted labubu.`);
      res.status(204).send();
    } else {
      console.log(`ROUTE: DELETE /api/admin/labubus/${req.params.sku} - Labubu not found.`);
      res.status(404).json({ error: `Labubu with sku "${req.params.sku}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the labubu.", details: err });
  }
});

//============================================================================================================================================================================================
// Role Routes
//============================================================================================================================================================================================

router.get("/roles", async (req, res) => {
  console.log("ROUTE: GET /api/admin/roles - Request received.");
  try {
    const roles = await roleService.getRoles();
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching roles.", details: err });
  }
});

router.get("/roles/:id", async (req, res) => {
  console.log(`ROUTE: GET /api/admin/roles/${req.params.id} - Request received.`);
  try {
    const role = await roleService.getRoleById(Number(req.params.id));
    if (role) {
      res.status(200).json(role);
    } else {
      res.status(404).json({ error: `Role with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the role.", details: err });
  }
});

router.post("/roles", async (req, res) => {
  console.log("ROUTE: POST /api/admin/roles - Request received.");
  try {
    const role = roleSchema.parse(req.body);
    const newRoleId = await roleService.createRole(role);
    res.status(201).json({ id: newRoleId, ...role });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while creating the role.", details: err });
  }
});

router.put("/roles/:id", async (req, res) => {
  console.log(`ROUTE: PUT /api/admin/roles/${req.params.id} - Request received.`);
  try {
    const role = roleSchema.partial().parse(req.body);
    const updatedCount = await roleService.updateRole(Number(req.params.id), role);
    if (updatedCount > 0) {
      res.status(200).json({ message: "Role updated successfully." });
    } else {
      res.status(404).json({ error: `Role with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating the role.", details: err });
  }
});

router.delete("/roles/:id", async (req, res) => {
  console.log(`ROUTE: DELETE /api/admin/roles/${req.params.id} - Request received.`);
  try {
    const deletedCount = await roleService.deleteRole(Number(req.params.id));
    if (deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: `Role with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the role.", details: err });
  }
});

//============================================================================================================================================================================================
// User Routes
//============================================================================================================================================================================================

router.get("/users", async (req, res) => {
  console.log("ROUTE: GET /api/admin/users - Request received.");
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching users.", details: err });
  }
});

router.get("/users/:id", async (req, res) => {
  console.log(`ROUTE: GET /api/admin/users/${req.params.id} - Request received.`);
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: `User with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the user.", details: err });
  }
});

router.post("/users", async (req, res) => {
  console.log("ROUTE: POST /api/admin/users - Request received.");
  try {
    const user = userSchema.parse(req.body);
    const newUserId = await userService.createUser(user);
    res.status(201).json({ id: newUserId, ...user });
  }
  catch (err) {
    res.status(500).json({ error: "An error occurred while creating the user.", details: err });
  }
});

router.put("/users/:id", async (req, res) => {
  console.log(`ROUTE: PUT /api/admin/users/${req.params.id} - Request received.`);
  try {
    const user = userSchema.partial().parse(req.body);
    const updatedCount = await userService.updateUser(Number(req.params.id), user);
    if (updatedCount > 0) {
      res.status(200).json({ message: "User updated successfully." });
    } else {
      res.status(404).json({ error: `User with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating the user.", details: err });
  }
});

router.delete("/users/:id", async (req, res) => {
  console.log(`ROUTE: DELETE /api/admin/users/${req.params.id} - Request received.`);
  try {
    const deletedCount = await userService.deleteUser(Number(req.params.id));
    if (deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: `User with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the user.", details: err });
  }
});

//============================================================================================================================================================================================
// Content Routes
//============================================================================================================================================================================================

router.get("/content", async (req, res) => {
  console.log("ROUTE: GET /api/admin/content - Request received.");
  try {
    const content = await contentService.getContent();
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching content.", details: err });
  }
});

router.get("/content/:id", async (req, res) => {
  console.log(`ROUTE: GET /api/admin/content/${req.params.id} - Request received.`);
  try {
    const content = await contentService.getContentById(Number(req.params.id));
    if (content) {
      res.status(200).json(content);
    } else {
      res.status(404).json({ error: `Content with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the content.", details: err });
  }
});

router.get("/content/key/:key", async (req, res) => {
  console.log(`ROUTE: GET /api/admin/content/key/${req.params.key} - Request received.`);
  try {
    const content = await contentService.getContentByKey(req.params.key);
    if (content) {
      res.status(200).json(content);
    } else {
      res.status(404).json({ error: `Content with key "${req.params.key}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the content by key.", details: err });
  }
});

router.post("/content", async (req, res) => {
  console.log("ROUTE: POST /api/admin/content - Request received.");
  try {
    const content = contentSchema.parse(req.body);
    const newContentId = await contentService.createContent(content);
    res.status(201).json({ id: newContentId, ...content });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while creating the content.", details: err });
  }
});

router.put("/content/:id", async (req, res) => {
  console.log(`ROUTE: PUT /api/admin/content/${req.params.id} - Request received.`);
  try {
    const content = contentSchema.partial().parse(req.body);
    const updatedCount = await contentService.updateContent(Number(req.params.id), content);
    if (updatedCount > 0) {
      res.status(200).json({ message: "Content updated successfully." });
    } else {
      res.status(404).json({ error: `Content with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating the content.", details: err });
  }
});

router.delete("/content/:id", async (req, res) => {
  console.log(`ROUTE: DELETE /api/admin/content/${req.params.id} - Request received.`);
  try {
    const deletedCount = await contentService.deleteContent(Number(req.params.id));
    if (deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: `Content with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the content.", details: err });
  }
});

//============================================================================================================================================================================================
// Navigation Routes
//============================================================================================================================================================================================

router.get("/navigation", async (req, res) => {
  console.log("ROUTE: GET /api/admin/navigation - Request received.");
  try {
    const navigation = await navigationService.getNavigation();
    res.status(200).json(navigation);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching navigation entries.", details: err });
  }
});

router.get("/navigation/:id", async (req, res) => {
  console.log(`ROUTE: GET /api/admin/navigation/${req.params.id} - Request received.`);
  try {
    const navigation = await navigationService.getNavigationById(Number(req.params.id));
    if (navigation) {
      res.status(200).json(navigation);
    } else {
      res.status(404).json({ error: `Navigation with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the navigation entry.", details: err });
  }
});

router.get("/navigation/name/:name", async (req, res) => {
  console.log(`ROUTE: GET /api/admin/navigation/name/${req.params.name} - Request received.`);
  try {
    const navigation = await navigationService.getNavigationByName(req.params.name);
    if (navigation) {
      res.status(200).json(navigation);
    } else {
      res.status(404).json({ error: `Navigation with name "${req.params.name}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the navigation entry by name.", details: err });
  }
});

router.post("/navigation", async (req, res) => {
  console.log("ROUTE: POST /api/admin/navigation - Request received.");
  try {
    const navigation = navigationSchema.parse(req.body);
    const newNavigationId = await navigationService.createNavigation(navigation);
    res.status(201).json({ id: newNavigationId, ...navigation });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while creating the navigation entry.", details: err });
  }
});

router.put("/navigation/:id", async (req, res) => {
  console.log(`ROUTE: PUT /api/admin/navigation/${req.params.id} - Request received.`);
  try {
    const navigation = navigationSchema.partial().parse(req.body);
    const updatedCount = await navigationService.updateNavigation(Number(req.params.id), navigation);
    if (updatedCount > 0) {
      res.status(200).json({ message: "Navigation entry updated successfully." });
    } else {
      res.status(404).json({ error: `Navigation with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating the navigation entry.", details: err });
  }
});

router.delete("/navigation/:id", async (req, res) => {
  console.log(`ROUTE: DELETE /api/admin/navigation/${req.params.id} - Request received.`);
  try {
    const deletedCount = await navigationService.deleteNavigation(Number(req.params.id));
    if (deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: `Navigation with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the navigation entry.", details: err });
  }
});



//============================================================================================================================================================================================
// Settings Routes
//============================================================================================================================================================================================

router.get("/settings", async (req, res) => {
  console.log("ROUTE: GET /api/admin/settings - Request received.");
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching settings.", details: err });
  }
});

router.get("/settings/:id", async (req, res) => {
  console.log(`ROUTE: GET /api/admin/settings/${req.params.id} - Request received.`);
  try {
    const settings = await settingsService.getSettingById(Number(req.params.id));
    if (settings) {
      res.status(200).json(settings);
    } else {
      res.status(404).json({ error: `Setting with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the setting.", details: err });
  }
});

router.get("/settings/key/:key", async (req, res) => {
  console.log(`ROUTE: GET /api/admin/settings/key/${req.params.key} - Request received.`);
  try {
    const settings = await settingsService.getSettingByKey(req.params.key);
    if (settings) {
      res.status(200).json(settings);
    } else {
      res.status(404).json({ error: `Setting with key "${req.params.key}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the setting by key.", details: err });
  }
});

router.post("/settings", async (req, res) => {
  console.log("ROUTE: POST /api/admin/settings - Request received.");
  try {
    const settings = settingsSchema.parse(req.body);
    const newSettingId = await settingsService.createSetting(settings);
    res.status(201).json({ id: newSettingId, ...settings });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while creating the setting.", details: err });
  }
});

router.put("/settings/:id", async (req, res) => {
  console.log(`ROUTE: PUT /api/admin/settings/${req.params.id} - Request received.`);
  try {
    const settings = settingsSchema.partial().parse(req.body);
    const updatedCount = await settingsService.updateSetting(Number(req.params.id), settings);
    if (updatedCount > 0) {
      res.status(200).json({ message: "Setting updated successfully." });
    } else {
      res.status(404).json({ error: `Setting with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating the setting.", details: err });
  }
});

router.delete("/settings/:id", async (req, res) => {
  console.log(`ROUTE: DELETE /api/admin/settings/${req.params.id} - Request received.`);
  try {
    const deletedCount = await settingsService.deleteSetting(Number(req.params.id));
    if (deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: `Setting with ID "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the setting.", details: err });
  }
});

export default router;
