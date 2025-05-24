from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import bcrypt 
import hashlib

# Flask app
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Finology.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(50), nullable=False)
    phoneNumber = db.Column(db.String(15), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

class ManualExpense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    business = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return f'<ManualExpense {self.id}>'

with app.app_context():
    db.create_all()

class PaymentDue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<PaymentDue {self.id}>'

@app.route('/')
def index():
    return jsonify('Welcome to the Finology API Server!'), 200

@app.route('/auth/signup', methods=['POST'])
def create_user():
    data = request.get_json()

    phone_number = data['phoneNumber']
    hashed_phone_number = hashlib.sha256(phone_number.encode('utf-8')).hexdigest()
    
    email = data['email']
    hashed_email = hashlib.sha256(email.encode('utf-8')).hexdigest()
    
    password = data['password'].encode('utf-8')
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
    
    if User.query.filter_by(phoneNumber=hashed_phone_number).first():
        return jsonify({'error': 'Phone number already exists'}), 400
    if User.query.filter_by(email=hashed_email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    new_user = User(
        username=data['username'],
        password=hashed_password,
        phoneNumber=hashed_phone_number,
        email=hashed_email
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully!'}), 201

@app.route('/auth/login', methods=['POST'])
def login_user():
    data = request.get_json()
    input_phone = data['phoneNumber']
    input_password = data['password']

    hashed_phone = hashlib.sha256(input_phone.encode('utf-8')).hexdigest()
    
    user = User.query.filter_by(phoneNumber=hashed_phone).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if bcrypt.checkpw(input_password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'message': 'Login successful!', 'username': user.username, 'userId': user.id}), 200
    else:
        return jsonify({'error': 'Invalid password'}), 401


@app.route('/manual-entry', methods=['POST'])
def add_manual_entry():
    data = request.get_json()
    user_id = data['user_id']
    amount = data['amount']
    category = data['category']
    business = data['business']
    date = data['date']
    description = data['description']

    new_entry = ManualExpense(
        user_id=user_id,
        amount=amount,
        category=category,
        business=business,
        date=date,
        description=description
    )
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({'message': 'Expense added successfully!'}), 201


@app.route('/get-manual-entry', methods=['POST'])
def get_manual_entry():
    user_id = request.get_json()

    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    entries = ManualExpense.query.filter_by(user_id=user_id).all()

    if not entries:
        return jsonify({'error': 'No entries found for this user'}), 404

    result = [
        {
            'id': entry.id,
            'user_id': entry.user_id,
            'amount': entry.amount,
            'category': entry.category,
            'business': entry.business,
            'date': entry.date,
            'description': entry.description
        }
        for entry in entries
    ]

    return jsonify(result), 200


@app.route('/payment-due', methods=['POST'])
def add_payment_due():
    data = request.get_json()
    new_due = PaymentDue(
        user_id=data['user_id'],
        amount=data['amount'],
        description=data.get('description'),
        category=data['category'],
        date=data['date']
    )
    db.session.add(new_due)
    db.session.commit()
    return jsonify({'message': 'PaymentDue added successfully', 'id': new_due.id}), 201

@app.route('/payment-due/<int:id>', methods=['PUT'])
def edit_payment_due(id):
    data = request.get_json()
    due = PaymentDue.query.get_or_404(id)

    due.user_id = data.get('user_id', due.user_id)
    due.amount = data.get('amount', due.amount)
    due.description = data.get('description', due.description)
    due.category = data.get('category', due.category)
    due.date = data.get('date', due.date)

    db.session.commit()
    return jsonify({'message': 'PaymentDue updated successfully'})

@app.route('/payment-due/<int:id>', methods=['DELETE'])
def delete_payment_due(id):
    due = PaymentDue.query.get_or_404(id)
    db.session.delete(due)
    db.session.commit()
    return jsonify({'message': 'PaymentDue deleted successfully'})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="192.168.0.100", port=5000, debug=True)