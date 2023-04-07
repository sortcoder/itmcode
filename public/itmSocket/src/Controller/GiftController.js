
// import UserModel from '../Models/User';


/**
 *  Gift Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */

const params = ['zole', 'popularity', 'giftImg'];
const userParams = ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', 'userId'];

class GiftController {

    /**
     * Create gift
     */
    create = async (req, res) => {
        try {
            // Errors of the express validators from route
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error = errors.array();
                return res.status(400).json(error);
            }

            // Path for uploading files
            const splitUrl = req.baseUrl.split('/');
            const folderName = splitUrl[splitUrl.length - 1];
            const dir = 'uploads/' + folderName;

            const {zole, popularity} = req.body;
            // Check if gift exists
            const isGiftExists = await Common.findSingle(GiftModel, {zole, popularity}, ['_id']);
            // Returns error if gift exists

            if (isGiftExists) {
                // Delete related uploaded files from the folder
                if (req.file.filename && dir + req.file.filename) {
                    fs.unlink(dir + '/' + req.file.filename, (err => {
                        if (err) console.log(err);
                    }));
                }
                // Returns error if page already exists
                return buildResult(res, 400, {}, {}, {message: req.t(constants.ALREADY_REGISTERED)});
            }

            // Set url path for uploaded file
            req.body.giftImg = process.env.IMAGE_URL + folderName + '/' + req.file.filename;

            req.body.createdBy = req.body.updatedBy = req.user._id;
            // Create Gift
            const giftData = await Common.create(GiftModel, req.body);
            // Send Response
            const result = {
                message: req.t(constants.CREATED),
                giftData,
            };
            return buildResult(res, 200, result);
        } catch (error) {
            // Returns unspecified exceptions
            return buildResult(res, 500, {}, {}, error);
        }
    };

    /**
     * List of all the gifts
     */
    index = async (req, res) => {
        try {
            const {queryLimit, page} = req.query;
            const currentPage = parseCurrentPage(page);
            const limit = parseLimit(queryLimit);
            const query = {isDeleted: false};
            // Get list of all gifts
            const {result, totalCount} = await paginationResult(
                query,
                GiftModel,
                currentPage,
                '',
                ['_id', 'zole', 'popularity', 'giftImg']
            );

            // Get pagination data
            //const paginationData = pagination(totalCount, currentPage, limit);
            // Send Response
            return buildResult(res, 200, result);
        } catch (error) {
            // Returns unspecified exceptions
            return buildResult(res, 500, {}, {}, error);
        }
    };

    /**
     * Detail of Gift
     */
    single = async (req, res) => {
        try {
            // Errors of the express validators from route
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error = errors.array();
                return res.status(400).json(error);
            }
            const {id} = req.params;
            // Find gift data
            let giftData = await Common.findById(GiftModel, id, params);
            // Send response
            return buildResult(res, 200, giftData);
        } catch (error) {
            // Returns unspecified exceptions
            return buildResult(res, 500, {}, {}, error);
        }
    };

    /**
     * Update Gift data
     */
    update = async (req, res) => {
        try {
            // Errors of the express validators from route
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error = errors.array();
                return res.status(400).json(error);
            }

            // Path for uploading files
            const splitUrl = req.baseUrl.split('/');
            const folderName = splitUrl[splitUrl.length - 1];
            const dir = 'uploads/' + folderName;

            const {id} = req.params;
            req.body.updatedBy = req.user._id;
            // Check if gift exists or not
            const giftData = await Common.findById(GiftModel, id, ['_id']);
            // Returns error if gift not exists
            if (!giftData) return buildResult(res, 400, {}, {}, {message: req.t(constants.INVALID_ID)});

            if (req.file && req.file.filename) {
                // Delete old file if new file is there to upload
                if (giftData && giftData.fileUrl) {
                    const splitFile = giftData.fileUrl.split('/');
                    const file = splitFile[splitFile.length - 1];
                    fs.unlink(dir + '/' + file, (err => {
                        if (err) console.log(err);
                    }));
                }
                // Set path for new file
                req.body.giftImg = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
            }

            // Update gift data
            const result = await Common.update(GiftModel, {_id: id}, req.body);
            // Send response
            return buildResult(res, 200, result);
        } catch (error) {
            // Returns unspecified exceptions
            return buildResult(res, 500, {}, {}, error);
        }
    };

    /**
     * Delete Gift
     */
    remove = async (req, res) => {
        try {
            // Errors of the express validators from route
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error = errors.array();
                return res.status(400).json(error);
            }
            const {id} = req.params;
            // Find gift data
            const giftData = await Common.findById(GiftModel, id, ['_id']);
            // Returns error if gift not exists
            if (!giftData) return buildResult(res, 400, {}, {}, {message: req.t(constants.INVALID_ID)});

            // Soft delete Gift
            await Common.update(GiftModel, {_id: id}, {isDeleted: true, updatedBy: req.user._id});
            // Send response
            const result = {
                message: req.t(constants.DELETED)
            };
            return buildResult(res, 200, result);
        } catch (error) {
            // Returns unspecified exceptions
            return buildResult(res, 500, {}, {}, error);
        }
    };

    sendGift = async (req, res) => {
        try {
            const {_id} = req.user;
            const {giftId, quantity, giftedTo} = req.body;
            const loggedInUser = await Common.findById(UserModel, _id, ['name', 'wallet', 'popularity']);
            req.body.createdBy = req.body.updatedBy = req.body.userId = _id;
            const gift = await Common.findById(GiftModel, giftId, ['zole', 'popularity']);
            const result = await Common.create(SendGiftModel, req.body);
            const newWallet = loggedInUser.wallet - (gift.zole * quantity);
            const giftedUser = await Common.findById(UserModel, giftedTo, ['deviceToken', 'wallet','popularity']);
        

            // const newWalletOfGift = giftedUser.wallet ? giftedUser.wallet + (gift.zole * quantity) : gift.zole * quantity;
            
            const newPopularity = giftedUser.popularity ? giftedUser.popularity + (gift.popularity * quantity): (gift.popularity ? (gift.popularity * quantity) : 0);
            console.log(newPopularity);
            await Common.update(UserModel, {_id}, {wallet: newWallet});
            
        /*     await Common.update(UserModel, {_id: giftedTo}, {wallet: newWalletOfGift, popularity: newPopularity}); */
        await Common.update(UserModel, {_id: giftedTo}, { popularity: newPopularity});
            if (giftedUser.deviceToken) {
                const receiverSetting = await UserSettings.findOne({ userId: giftedUser._id });
                const notificationData = {
                    toUser: giftedUser._id,
                    fromUser: _id,
                    title: 'Gift Received',
                    message: ` has sent you gift of ${gift.popularity * quantity} popularity`,
                    deviceToken: giftedUser.deviceToken,
                    createdBy: _id,
                    updatedBy: _id
                };
                if(receiverSetting.giftShow==true)
                {
                await Notifications.sendNotification(notificationData);
                }
            }
            if (loggedInUser.deviceToken) {
                const notificationData = {
                    toUser: loggedInUser._id,
                    fromUser: _id,
                    title: 'Gift',
                    message: ` you have spend ${gift.zole * quantity} zoles `,
                    deviceToken: loggedInUser.deviceToken,
                    createdBy: _id,
                    updatedBy: _id
                };
                const sendoerSetting = await UserSettings.findOne({ userId: loggedInUser._id });
                if(sendoerSetting.giftShow==true)
                {
                await Notifications.sendNotification(notificationData);
                }
            }
            return buildResult(res, 200, result);
        } catch (error) {
            // Returns unspecified exceptions
            return buildResult(res, 500, {}, {}, error);
        }
    };

    userGifts = async (req, res) => {
        try {
            const {id} = req.params;
            const populateField = [{
                path: 'giftId',
                select: ['giftImg']
            }];
            let gifts = await Common.list(SendGiftModel, {giftedTo: id}, ['giftId', 'quantity'], populateField);
            const giftArr = [];
            if (gifts && gifts.length) {
                gifts = _.groupBy(gifts, 'giftId._id');
                for (const [key, value] of Object.entries(gifts)) {
                    for (let obj of value) {
                        if( obj.giftId &&  obj.giftId.giftImg)
                        {

                       
                        if (giftArr && giftArr.length) {
                            const index = giftArr.findIndex(obj => obj.giftId === key);
                            if (index === -1) {
                                giftArr.push({
                                    giftId: key,
                                    giftImage:  obj.giftId ? obj.giftId.giftImg : '',
                                    quantity: obj.quantity
                                });
                            } else {
                                giftArr[index].quantity = giftArr[index].quantity + obj.quantity;
                            }
                        } else {
                            giftArr.push({
                                giftId: key,
                                giftImage: obj.giftId ? obj.giftId.giftImg : '',
                                quantity: obj.quantity
                            })
                        }
                    }
                    }
                }
                gifts = giftArr;
            }
            console.log(gifts);
            return buildResult(res, 200, {gifts});
        } catch (error) {
            // Returns unspecified exceptions
            return buildResult(res, 500, {}, {}, error);
        }
    }
}

export default new GiftController();
