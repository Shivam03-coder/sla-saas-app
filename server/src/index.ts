import { Response } from "express";
import { app } from "./app";
import { appEnvConfigs } from "./configs";
import { ApiResponse } from "./helpers/server-functions";

(() => {
  app.get("/", async (_, res: Response) => {
    res.json(
      new ApiResponse(200, "welcome to server dveloped by shivam anand")
    );
  });

  app.listen(appEnvConfigs.PORT, () => {
    console.log(`Server started at http://localhost:${appEnvConfigs.PORT}`);
  });
})();
