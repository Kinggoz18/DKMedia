import { AboutUsModel } from "../schema/aboutUs.js";
import { ReplyError } from "../interfaces/ReplyError.js";
export class AboutUsService {
    constructor(dbCollection, logger) {
        this.dbModel = AboutUsModel;
        /**
         * Add/Update about us section
         * @param request
         * @param reply
         */
        this.updateAboutUs = async (request, reply) => {
            try {
                const { title, paragraphs, } = request.body;
                //Validate the request 
                const aboutUs = new this.dbModel({ title, paragraphs });
                await aboutUs.validate();
                const currentAboutUs = await this.dbCollection.findOne({});
                //If there is no about us
                if (!currentAboutUs) {
                    const updateAboutUs = await this.dbCollection.insertOne(aboutUs);
                    const getSavedAboutUs = await this.dbCollection.findOne({ _id: updateAboutUs?.insertedId });
                    if (!getSavedAboutUs) {
                        this.logger.error('Failed to save about us');
                        throw new ReplyError("Failed to save about us", 400);
                    }
                    return reply.code(200).send({ data: getSavedAboutUs, success: updateAboutUs.acknowledged });
                }
                else {
                    //Update the values
                    const updatedTitle = title === "" ? currentAboutUs.title : title;
                    // Insert the new update
                    const updateAboutUs = await this.dbCollection.updateOne({ _id: currentAboutUs?._id }, {
                        $set: {
                            title: updatedTitle,
                            paragraphs: paragraphs ?? currentAboutUs.paragraphs
                        }
                    });
                    if (!updateAboutUs.acknowledged) {
                        this.logger.error('Failed to update about us');
                        throw new ReplyError("Failed to update about us", 400);
                    }
                    const getSavedAboutUs = await this.dbCollection.findOne({ _id: currentAboutUs?._id });
                    if (!getSavedAboutUs) {
                        this.logger.error('Failed to get update about us');
                        throw new ReplyError("Failed to get update about us", 400);
                    }
                    return reply.code(200).send({ data: getSavedAboutUs, success: updateAboutUs.acknowledged });
                }
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        /**
         * Get about us section
         */
        this.getAboutUs = async (request, reply) => {
            try {
                const aboutUsSection = await this.dbCollection.findOne({});
                return reply.code(200).send({ data: aboutUsSection, success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        /**
         * Delete about us section
         */
        this.deleteAboutUs = async (request, reply) => {
            try {
                const deleteAboutUs = await this.dbCollection.deleteOne({});
                if (deleteAboutUs.deletedCount != 1)
                    throw new ReplyError("Nothing to delete", 404);
                return reply.code(200).send({ data: "Deleted about us", success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.dbCollection = dbCollection;
        this.logger = logger;
        if (!dbCollection) {
            logger.error("Failed to load event collection");
            return;
        }
    }
}
