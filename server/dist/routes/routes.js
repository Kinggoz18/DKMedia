import { UserRoute } from "./user.route.js";
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
export const initAppRoutes = async (server, database, done) => {
    try {
        const authRoute = new UserRoute(server, database, server.log);
        const eventRoute = new EventRoute(server, database, server.log);
        const aboutUsRoute = new AboutUsRoute(server, database, server.log);
        const contactUsRoute = new ContactUsRoute(server, database, server.log);
        const subscriptionRoute = new SubscriptionRoute(server, database, server.log);
        const organizerRoute = new OrganizerRoute(server, database, server.log);
        const uploadedMediaRoute = new UploadMediaRoute(server, database, server.log);
        const contactRoute = new ContactRoute(server, database, server.log);
        const articleRoute = new ArticleRoute(server, database, server.log);
        const newsletterHistoryRoute = new NewsletterHistoryRoute(server, database, server.log);
        const emailRoute = new EmailRoute(server, database, server.log);
        /***************************************************** Initialize Routes *****************************************************/
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
        done();
    }
    catch (error) {
        throw new Error(error.message);
    }
};
