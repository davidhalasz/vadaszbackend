const verifySession = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ sessionMessage: "There is no token session" });
      }
    
      const user = await User.findOne({
        where: {
          uuid: req.session.userId,
        },
      });
    
      if (!user) return res.status(404).json({ sessionMessage: "User not found" });
      req.userId = user.id;
      next();
}

module.exports = verifySession;