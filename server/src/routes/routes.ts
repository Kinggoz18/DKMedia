import { FastifyInstance } from "fastify"
import { UserRoute } from "./user.route.js"
import { mongodb } from "@fastify/mongodb";
import { EventRoute } from "./event.route.js";
import { UploadMediaRoute } from "./uploadedMedia.route.js";
import { OrganizerRoute } from "./organizer.route.js";
import { SubscriptionRoute } from "./subscription.route.js";
import { ContactUsRoute } from "./contactUs.route.js";
import { AboutUsRoute } from "./aboutUs.route.js";
import { ContactRoute } from "./contact.route.js";
import { ArticleRoute } from "./ArticleRoute.js";
import { NewsletterHistoryRoute } from "./newsletterHistory.route.js";
import { EmailRoute } from "./email.route.js";


export const initAppRoutes = async (server: FastifyInstance, database: mongodb.Db, done: any) => {
  try {
    const authRoute: UserRoute = new UserRoute(server, database, server.log);
    const eventRoute: EventRoute = new EventRoute(server, database, server.log);
    const aboutUsRoute: AboutUsRoute = new AboutUsRoute(server, database, server.log);
    const contactUsRoute: ContactUsRoute = new ContactUsRoute(server, database, server.log);
    const subscriptionRoute: SubscriptionRoute = new SubscriptionRoute(server, database, server.log);
    const organizerRoute: OrganizerRoute = new OrganizerRoute(server, database, server.log);
    const uploadedMediaRoute: UploadMediaRoute = new UploadMediaRoute(server, database, server.log);
    const contactRoute: ContactRoute = new ContactRoute(server, database, server.log);
    const articleRoute: ArticleRoute = new ArticleRoute(server, database, server.log);
    const newsletterHistoryRoute: NewsletterHistoryRoute = new NewsletterHistoryRoute(server, database, server.log);
    const emailRoute: EmailRoute = new EmailRoute(server, database, server.log);

    await authRoute.initRoutes();
    await eventRoute.initRoutes();
    await aboutUsRoute.initRoutes();
    await contactUsRoute.initRoutes();
    await subscriptionRoute.initRoutes();
    await organizerRoute.initRoutes();
    await uploadedMediaRoute.initRoutes();
    await contactRoute.initRoutes();
    await articleRoute.initRoutes();
    await newsletterHistoryRoute.initRoutes();
    await emailRoute.initRoutes();

    done()
  } catch (error: any) {
    throw new Error(error.message)
  }
}