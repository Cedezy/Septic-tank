
exports.paginate = async (Model, query = {}, options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    let findQuery = Model.find(query).skip(skip).limit(limit);

    if (options.select) {
        findQuery = findQuery.select(options.select);
    }

    if (options.populate) {
        options.populate.forEach(field => {
        findQuery = findQuery.populate(field);
        });
    }

    if (options.sort) {
        findQuery = findQuery.sort(options.sort);
    }

    const [total, data] = await Promise.all([
        Model.countDocuments(query),
        findQuery
    ]);

    return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};
