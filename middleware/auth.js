const connection = require('../config/connect.js');

const isAdmin = (req, res, next) => {
    const adminId = req.headers['admin-id'];
    const adminIdentifier = req.headers['admin-identifier'];
    
    if (!adminId || !adminIdentifier) {
        return res.status(401).json({ error: 'Unauthorized - Admin credentials required' });
    }
    
    const query = 'SELECT id FROM admin WHERE id = ? AND identifier = ?';
    connection.query(query, [adminId, adminIdentifier], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Unauthorized - Invalid admin credentials' });
        }
        
        next();
    });
};

const isStudent = (req, res, next) => {
    const studentId = req.headers['student-id'];
    const idenelev = req.headers['idenelev'];
    
    if (!studentId || !idenelev) {
        return res.status(401).json({ error: 'Unauthorized - Student credentials required' });
    }
    
    const query = 'SELECT id FROM eleve WHERE id = ? AND idenelev = ?';
    connection.query(query, [studentId, idenelev], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Unauthorized - Invalid student credentials' });
        }
        
        next();
    });
};

module.exports = {
    isAdmin,
    isStudent
}; 