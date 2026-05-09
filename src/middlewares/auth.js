module.exports = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No se proporcionó un token." });
    }
    //Contraseña
    if (token === "CAMELOT") {
        next(); 
    } else {
        res.status(403).json({ error: "Token inválido." });
    }
};