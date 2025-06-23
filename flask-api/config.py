import os
from dotenv import load_dotenv

# Load environment variables from root .env
load_dotenv()

def get_cors_origins():
    """Get CORS origins from environment variable with dynamic support"""
    cors_env = os.environ.get('CORS_ORIGINS')
    
    # Base origins dari environment
    origins = []
    if cors_env:
        origins.extend([origin.strip() for origin in cors_env.split(',')])
    
    # Development fallback origins
    dev_origins = [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]
    
    # Production origins
    prod_origins = [
        'https://werecooked.my.id',
        'http://werecooked.my.id',
    ]
    
    # Gabungkan semua origins dan remove duplicates
    all_origins = list(set(origins + dev_origins + prod_origins))
    
    # Filter empty strings
    return [origin for origin in all_origins if origin.strip()]

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'default-jwt-secret'
    JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM') or 'HS256'
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Recommendation settings
    MAX_RECOMMENDATIONS = int(os.environ.get('MAX_RECOMMENDATIONS', '50'))
    DEFAULT_RECOMMENDATIONS = int(os.environ.get('DEFAULT_RECOMMENDATIONS', '10'))
    
    # Model settings
    MODEL_PATH = os.environ.get('MODEL_PATH', './models/')
    
    # API URLs
    AUTH_BACKEND_URL = os.environ.get('AUTH_BACKEND_URL', 'http://localhost:3000')
    NODE_API_URL = os.environ.get('NODE_API_URL', 'http://localhost:3000/api')
    
    # CORS settings - Dynamic CORS origins
    CORS_ORIGINS = get_cors_origins()
    
    # Additional CORS settings
    CORS_ALLOW_HEADERS = [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key'
    ]
    
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_SUPPORTS_CREDENTIALS = True

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    # Override untuk development - lebih permissive
    CORS_ORIGINS = get_cors_origins() + [
        'http://localhost:*',  # Wildcard untuk development ports
        'http://127.0.0.1:*',
    ]

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    # Production - hanya origins yang diizinkan
    CORS_ORIGINS = [
        'https://werecooked.my.id',
        'http://werecooked.my.id',  # Fallback jika ada redirect
    ] + (get_cors_origins() if get_cors_origins() else [])

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    # Testing - permissive untuk testing
    CORS_ORIGINS = ['*']

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

# Helper function untuk mendapatkan config berdasarkan environment
def get_config():
    """Get configuration based on FLASK_ENV"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])