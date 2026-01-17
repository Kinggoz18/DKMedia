import { ObjectId } from "@fastify/mongodb";
import { OrganizerModel } from "../schema/organizer.js";
import { ReplyError } from "../interfaces/ReplyError.js";
export class OrganizerService {
    constructor(dbCollection, logger, r2BucketManager) {
        this.dbModel = OrganizerModel;
        /**
         * Add a new organizer
         * @param request
         * @param reply
         * @returns
         */
        this.addOrganizer = async (request, reply) => {
            try {
                const { name, logo } = request.body;
                //Validate organzier
                const organizer = new this.dbModel({ name, logo });
                await organizer.validate();
                // Add the organizer
                const organizerToAdd = await this.dbCollection.insertOne(organizer);
                const newOrganizer = await this.dbCollection.findOne({ _id: organizerToAdd?.insertedId });
                if (!newOrganizer) {
                    throw new ReplyError("Failed to add new organizer", 400);
                }
                return reply.code(201).send({ data: newOrganizer, success: true });
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
         * Delete an organizer from the database
         * Also deletes the associated logo from Cloudflare R2
         * @param request
         * @param reply
         * @returns
         */
        this.deleteOrganizer = async (request, reply) => {
            try {
                const { id } = request.params;
                //Check if the organizer exists
                const organizerExists = await this.dbCollection.findOne({ _id: new ObjectId(id) });
                if (!organizerExists?._id)
                    throw new ReplyError("Organizer does not exist", 404);
                // Delete the associated logo from R2 if it exists
                if (organizerExists.logo) {
                    try {
                        await this.r2BucketManager.deleteSingleResource(organizerExists.logo);
                        this.logger.info(`Deleted logo from R2: ${organizerExists.logo}`);
                    }
                    catch (r2Error) {
                        // Log the error but don't fail the deletion - the logo might already be deleted
                        this.logger.warn(`Failed to delete logo from R2: ${r2Error?.message}`);
                    }
                }
                //Delete the organizer from database
                const deleteResult = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
                if (deleteResult.deletedCount != 1) {
                    throw new ReplyError("Failed to delete organizer", 404);
                }
                return reply.code(200).send({ data: "Organizer and associated media deleted", success: true });
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
         * Get an organizer
         * @param request
         * @param reply
         * @returns
         */
        this.getOrganizerById = async (request, reply) => {
            try {
                const { id } = request.params;
                const organizer = await this.dbCollection.findOne({ _id: new ObjectId(id) });
                if (!organizer) {
                    throw new ReplyError("Organizer not found", 404);
                }
                return reply.code(200).send({ data: organizer, success: true });
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
         * Update an organizer
         * @param request
         * @param reply
         * @returns
         */
        this.updateOrganizer = async (request, reply) => {
            try {
                const { id, name, logo } = request.body;
                //Get the old organizer to be updated
                const organizerToUpdate = await this.dbCollection.findOne({ _id: new ObjectId(id) });
                if (!organizerToUpdate) {
                    throw new ReplyError("Organizer not found", 404);
                }
                // Update the neccessary fields
                const newName = name ?? organizerToUpdate.name;
                const newLogo = logo ?? organizerToUpdate.logo;
                await this.dbCollection.updateOne({ _id: organizerToUpdate._id }, {
                    $set: {
                        name: newName,
                        logo: newLogo
                    }
                });
                // Return the updated document
                const updatedOrganizer = await this.dbCollection.findOne({ _id: organizerToUpdate._id });
                if (!updatedOrganizer) {
                    throw new ReplyError("Updated organizer not found", 404);
                }
                return reply.code(200).send({ data: updatedOrganizer, success: true });
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
         * Get all organizers
         * @param request
         * @param reply
         * @returns
         */
        this.getAllOrganizer = async (request, reply) => {
            try {
                const allOrganizer = await this.dbCollection.find({}).toArray();
                return reply.code(200).send({ data: allOrganizer, success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.dbCollection = dbCollection;
        this.logger = logger;
        this.r2BucketManager = r2BucketManager;
        if (!dbCollection) {
            logger.error("Failed to load organizer collection");
            return;
        }
        if (!r2BucketManager) {
            throw new Error("CloudflareR2BucketManager is missing");
        }
    }
}
