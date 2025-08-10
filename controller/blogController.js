const blogModel = require('../model/Blog');
module.exports = {
    getAllBlog: async function (req, res) {
        let size = req.body.size || 10;
        let pageNo = req.body.pageNo || 1; 
        const query={};
        query.skip = Number(size * (pageNo - 1));
        query.limit = Number(size) || 0;
        const sort = { _id: -1 };
        const totalBlog = await blogModel.count({isActive:true});
        if(totalBlog>0){
            const blog = await blogModel.find({isActive:true}).sort(sort).skip(query.skip).limit(query.limit);
            res.status(200).json({data:blog,total:totalBlog});
        }else{
            res.status(200).json({data:[],total:totalBlog}); 
        }
       
    },
}