import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary"


export const createPost = async(req,res)=>{
   try {
        const {text} = req.body;
        let { img }= req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId)
        if(!user) return res.status(400).json({message: "User not found"})
        if(!text && !img){
            return res.status(400).json({error: "Post must have text or imgae"});
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        })

        await newPost.save();
        return res.status(201).json(newPost);

   } catch (error) {
        res.status(500).json({error: error.message});
        console.log("Error in createPost controller: ",error);
   } 
};


export const deletePost = async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(401).json({error: "Post not found"})
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "You are not authorized to delete this post"})
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({message: "Post deleted successfully"});
    } catch (error) {
        console.log("Error in deletePost controller: ",error);
        res.status(500).json({error: "Internal server error"});
    }
}


export const commentOnPost = async (req,res)=>{
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({error: "Text field is required"});
        }

        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({error: "Post not found"})

        const comment = {user: userId, text}

        post.comments.push(comment);
        await post.save();
    
        //We are fetching data after the new comment got saved so that we can populate on the new comment too//
        // otherwise it only give all comments user before the new comment so that is why we do after save new comment//
        const updatedPost = await Post.findById(postId).populate({
            path: "user",
            select: "-password"
          })
          .populate({
            path: "comments.user",
            select: "-password",
          });

        res.status(200).json(updatedPost);

    } catch (error) {
        console.log("Error in commentOnPost Controller: ", error);
        res.status(500).json({error: "Internal server error"});
    }
}


export const likeUnlikePost = async(req,res)=>{
    try {
        const userId = req.user._id;
        //we are destructing from params and providing id which we destruct a new name
        const {id: postId} = req.params; 
        
        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({error: "Post not found"});

        const userLikedPost = post.likes.includes(userId);

        if(userLikedPost){
            // Unlike Post
            await Post.updateOne({_id:postId}, {$pull:{likes:userId}});
            await User.updateOne({_id:userId},{$pull:{likedPosts: postId}});
            
/* Note: In Simple words we fetch the 'Post' data in the starting then we are making changes so if we send 
post.likes in response it will include that user coz it fetch the data already before the changes happens
so we have to manually filter the Post so that we can send the update one likes array.
*/
            const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString());
            res.status(200).json(updatedLikes);
        } else{
            post.likes.push(userId); //In array we can only push and pull/push is typically use in database.
            await User.updateOne({_id: userId },{$push:{ likedPosts: postId} });
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save();
            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }

    } catch (error) {
        console.log("Error in likeUnlikePost Controller: ", error);
        res.status(500).json({error: "Internal server error"});
    }
}



export const getAllPost = async (req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password",
        })

        if(posts.lenght === 0){
            return res.status(200).json([])
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getAllPost controller: ", error);
        res.status(500).json({error: "Internal server error"});
    }
}



export const getLikedPosts = async (req,res)=>{
    const userId = req.params.id;

    try{
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error: "User not found"});

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select:"-password"
        });

        res.status(200).json(likedPosts);

    } catch(error){
        console.log("Error in getLikedPosts controller: ",error);
        res.status(500).json({error: "Internal server error"});
    }
};


export const getFollowingPosts = async(req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ error: "User not found"});

        const following = user.following;

        const feedPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1}).
        populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select:"-password",
        })

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Error in getFollowingPosts controller: ",error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getUserPosts = async (req,res)=>{
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if(!user) return res.status(404).json({error: "User not found"});

        const posts = await Post.find({user: user._id}).sort({createdAt: -1})
        .populate(
            {
                path: "user",
                select: "-password"
            })
        .populate(
            {
                path: "comments.user",
                select: "-password"
            })
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getUserPosts controller: ",error);
        res.status(500).json({error: "Internal server error"});
    }
}