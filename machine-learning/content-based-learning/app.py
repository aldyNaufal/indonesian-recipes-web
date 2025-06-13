from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import json
import gzip
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import load_npz
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

app = Flask(__name__)
CORS(app)

# Global variables untuk menyimpan model
vectorizer = None
cosine_sim_sparse = None
recipes_df = None
stemmer = None
tfidf_matrix = None

def load_optimized_models():
    """Load semua model yang sudah dioptimasi"""
    global vectorizer, cosine_sim_sparse, recipes_df, stemmer, tfidf_matrix
    
    try:
        print("Loading optimized models...")
        
        # Load TF-IDF Vectorizer
        with open('tfidf_vectorizer.pkl', 'rb') as f:
            vectorizer = pickle.load(f)
        print("✓ TF-IDF Vectorizer loaded")
        
        # Load Sparse Cosine Similarity Matrix
        cosine_sim_sparse = load_npz('cosine_similarity_sparse.npz')
        print("✓ Sparse Cosine Similarity Matrix loaded")
        
        # Load compressed recipes data
        recipes_df = pd.read_csv('processed_recipes.csv.gz', compression='gzip')
        print("✓ Recipes data loaded")
        
        # Load stemmer
        with open('stemmer.pkl', 'rb') as f:
            stemmer = pickle.load(f)
        print("✓ Stemmer loaded")
        
        # Load recipe JSON untuk tags
        with gzip.open('recipes.json.gz', 'rt', encoding='utf-8') as f:
            recipes_json = json.load(f)
        
        # Buat mapping untuk tags
        tags_mapping = {recipe['title']: recipe['tags'] for recipe in recipes_json}
        recipes_df['tags'] = recipes_df['Title'].map(tags_mapping)
        
        # Pre-compute TF-IDF matrix untuk efisiensi
        tfidf_matrix = vectorizer.transform(recipes_df['tags'].fillna(''))
        print("✓ TF-IDF matrix computed")
        
        print("All optimized models loaded successfully!")
        return True
        
    except Exception as e:
        print(f"Error loading optimized models: {str(e)}")
        return False

def normalize_ingredients(ingredients):
    """Normalize ingredient names untuk handle variasi nama"""
    ingredient_mapping = {
        'telor': 'telur',
        'telur': 'telur',
        'cabe': 'cabai',
        'lombok': 'cabai',
        'cabai': 'cabai',
        'bawang merah': 'bawang',
        'bawang putih': 'bawang',
        'bawang': 'bawang',
        'ayam': 'ayam',
        'daging sapi': 'daging',
        'daging ayam': 'ayam',
        'tomat': 'tomat',
        'wortel': 'wortel',
        'kentang': 'kentang',
        'mie': 'mi',
        'nasi': 'beras'
    }
    
    if isinstance(ingredients, list):
        normalized = []
        for ingredient in ingredients:
            ingredient_lower = str(ingredient).lower().strip()
            normalized.append(ingredient_mapping.get(ingredient_lower, ingredient_lower))
        return normalized
    else:
        ingredient_lower = str(ingredients).lower().strip()
        return ingredient_mapping.get(ingredient_lower, ingredient_lower)

def recommend_from_ingredients(ingredients_list, top_n=10, min_rating=None, max_rating=None, 
                             complexity_filter=None, min_similarity=0.05):
    """
    Fungsi rekomendasi berdasarkan multiple ingredients - FIXED VERSION
    
    Args:
        ingredients_list: List of ingredients ['telur', 'bawang', 'ayam'] atau single string
        top_n: Number of recommendations
        min_rating: Minimum rating filter
        max_rating: Maximum rating filter
        complexity_filter: Complexity level filter
        min_similarity: Minimum similarity threshold
    
    Returns:
        List of dictionaries containing recommendations
    """
    try:
        # 1. Handle input format - support both list and string
        if isinstance(ingredients_list, list):
            # Normalize each ingredient in the list
            normalized_ingredients = normalize_ingredients(ingredients_list)  # FIX: menggunakan ingredients_list bukan ingredients
            keyword = ' '.join(normalized_ingredients)
            ingredient_list = normalized_ingredients
        else:
            # Single string input
            keyword = str(ingredients_list).lower().strip()
            normalized_keyword = normalize_ingredients(keyword)
            keyword = normalized_keyword
            ingredient_list = keyword.split()
        
        print(f"🔍 Processing ingredients: {ingredient_list}")
        
        # 2. Stemming keyword
        stemmed_keyword = ' '.join([stemmer.stem(word) for word in keyword.split()])
        print(f"🔤 Stemmed query: {stemmed_keyword}")
        
        # 3. TF-IDF vector untuk keyword
        keyword_vector = vectorizer.transform([stemmed_keyword])
        
        # 4. Hitung similarity dengan pre-computed matrix
        sim_scores = cosine_similarity(keyword_vector, tfidf_matrix).flatten()
        
        # 5. Filter berdasarkan minimum similarity threshold
        valid_indices = sim_scores >= min_similarity
        
        if not valid_indices.any():
            print(f"⚠️ No recipes found with similarity >= {min_similarity}")
            return {
                'success': False,
                'message': f'Tidak ada resep yang cocok dengan bahan: {", ".join(ingredient_list)}',
                'suggestions': 'Coba gunakan bahan yang lebih umum atau turunkan kriteria pencarian',
                'recommendations': []
            }
        
        # 6. Get top results
        filtered_indices = np.where(valid_indices)[0]
        filtered_scores = sim_scores[filtered_indices]
        sorted_order = np.argsort(filtered_scores)[::-1]
        top_indices = filtered_indices[sorted_order]
        
        # 7. Create results DataFrame
        results = recipes_df.iloc[top_indices].copy()
        results['similarity_score'] = sim_scores[top_indices]
        
        original_count = len(results)
        
        # 8. Apply filters with safe type conversion
        if min_rating is not None:
            # FIX: Safe rating comparison
            results = results[pd.to_numeric(results['Rating'], errors='coerce') >= min_rating]
            print(f"📊 After min_rating filter: {len(results)} recipes")
            
        if max_rating is not None:
            # FIX: Safe rating comparison
            results = results[pd.to_numeric(results['Rating'], errors='coerce') <= max_rating]
            print(f"📊 After max_rating filter: {len(results)} recipes")
            
        if complexity_filter:
            results = results[results['Complexity'] == complexity_filter]
            print(f"⚡ After complexity filter: {len(results)} recipes")
        
        # 9. Check if we have results after filtering
        if len(results) == 0:
            return {
                'success': False,
                'message': 'Tidak ada resep yang memenuhi semua kriteria filter',
                'suggestions': 'Coba kurangi filter atau ubah kriteria pencarian',
                'filters_applied': {
                    'min_rating': min_rating,
                    'max_rating': max_rating,
                    'complexity': complexity_filter
                },
                'recommendations': []
            }
        
        # 10. Get final results
        final_results = results.head(top_n)
        
        # 11. Format output with safe data handling
        recommendations = []
        for _, row in final_results.iterrows():
            # FIX: Safe data conversion with fallbacks
            try:
                rating_val = int(pd.to_numeric(row['Rating'], errors='coerce'))
                if pd.isna(rating_val):
                    rating_val = 0
            except (ValueError, TypeError):
                rating_val = 0
                
            rec = {
                'title': str(row['Title']) if pd.notna(row['Title']) else 'Unknown',
                'category': str(row['Category']) if pd.notna(row['Category']) else 'Unknown',
                'ingredients': str(row['Ingredients']) if pd.notna(row['Ingredients']) else '',
                'steps': str(row['Steps']) if pd.notna(row['Steps']) else '',
                'rating': rating_val,
                'complexity': str(row['Complexity']) if pd.notna(row['Complexity']) else 'Unknown',
                'similarity_score': round(float(row['similarity_score']), 4)
            }
            recommendations.append(rec)
        
        return {
            'success': True,
            'message': f'Ditemukan {len(recommendations)} resep untuk bahan: {", ".join(ingredient_list)}',
            'search_ingredients': ingredient_list,
            'total_found': original_count,
            'after_filters': len(results),
            'similarity_range': {
                'min': round(float(final_results['similarity_score'].min()), 4),
                'max': round(float(final_results['similarity_score'].max()), 4)
            },
            'recommendations': recommendations
        }
        
    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        import traceback
        traceback.print_exc()  # FIX: Print full traceback untuk debugging
        return {
            'success': False,
            'message': f'Error dalam pencarian: {str(e)}',
            'recommendations': []
        }
        
def recommend_similar_recipes(recipe_title, top_n=10):
    """Rekomendasi berdasarkan resep yang mirip - optimized version"""
    try:
        # Validasi input
        if not recipe_title or not isinstance(recipe_title, str):
            return {
                'success': False,
                'message': 'Title resep harus berupa string yang valid',
                'recommendations': []
            }
        
        # Cari index resep berdasarkan title
        recipe_idx = recipes_df[recipes_df['Title'].str.lower() == recipe_title.lower()].index
        
        if len(recipe_idx) == 0:
            return {
                'success': False,
                'message': f'Resep "{recipe_title}" tidak ditemukan',
                'recommendations': []
            }
        
        recipe_idx = recipe_idx[0]
        
        # Ambil similarity scores dari sparse matrix
        try:
            sim_scores = cosine_sim_sparse[recipe_idx].toarray().flatten()
        except (AttributeError, IndexError) as e:
            return {
                'success': False,
                'message': f'Error mengakses similarity matrix: {str(e)}',
                'recommendations': []
            }
        
        # Buat list dengan scores
        sim_scores_with_idx = list(enumerate(sim_scores))
        
        # Sort berdasarkan similarity score
        sim_scores_with_idx = sorted(sim_scores_with_idx, key=lambda x: x[1], reverse=True)
        
        # Ambil top_n+1 (karena index 0 adalah resep itu sendiri)
        sim_scores_with_idx = sim_scores_with_idx[1:top_n+1]
        
        # Filter hasil dengan similarity > 0 (karena kita pakai sparse matrix)
        sim_scores_with_idx = [(idx, score) for idx, score in sim_scores_with_idx if score > 0]
        
        if not sim_scores_with_idx:
            # Jika tidak ada hasil dari sparse matrix, gunakan TF-IDF similarity
            try:
                recipe_vector = tfidf_matrix[recipe_idx]
                sim_scores = cosine_similarity(recipe_vector, tfidf_matrix).flatten()
                sim_scores_with_idx = list(enumerate(sim_scores))
                sim_scores_with_idx = sorted(sim_scores_with_idx, key=lambda x: x[1], reverse=True)
                sim_scores_with_idx = sim_scores_with_idx[1:top_n+1]
            except Exception as e:
                return {
                    'success': False,
                    'message': f'Error dalam fallback similarity calculation: {str(e)}',
                    'recommendations': []
                }
        
        # Ambil indices resep yang mirip
        recipe_indices = [i[0] for i in sim_scores_with_idx]
        
        # Return resep yang direkomendasikan
        recommended_recipes = recipes_df.iloc[recipe_indices][
            ['Title','Category','Ingredients', 'Steps', 'URL', 'Rating', 'Complexity']
        ].copy()
        recommended_recipes['similarity_score'] = [score[1] for score in sim_scores_with_idx]
        
        recommendations = []
        # FIX: Perbaiki syntax error di sini
        for _, row in recommended_recipes.iterrows():
            try:
                # Validasi dan konversi rating dengan safety check
                rating_val = row['Rating']
                if pd.notna(rating_val):
                    try:
                        rating = int(float(rating_val))  # Convert to float first, then int
                    except (ValueError, TypeError):
                        rating = 0
                else:
                    rating = 0
                
                rec = {
                    'title': row['Title'],
                    'category': row['Category'] if pd.notna(row['Category']) else '',
                    'ingredients': row['Ingredients'] if pd.notna(row['Ingredients']) else '',
                    'steps': row['Steps'] if pd.notna(row['Steps']) else '',
                    'url': row['URL'] if pd.notna(row['URL']) else '',
                    'rating': rating,
                    'complexity': row['Complexity'] if pd.notna(row['Complexity']) else '',
                    'similarity_score': round(float(row['similarity_score']), 4)
                }
                recommendations.append(rec)
            except Exception as e:
                print(f"Error processing recipe row: {str(e)}")
                continue  # Skip problematic rows instead of failing completely
        
        return {
            'success': True,
            'message': f'Ditemukan {len(recommendations)} resep yang mirip dengan "{recipe_title}"',
            'base_recipe': recipe_title,
            'recommendations': recommendations
        }
        
    except KeyError as e:
        return {
            'success': False,
            'message': f'Column tidak ditemukan: {str(e)}',
            'recommendations': []
        }
    except Exception as e:
        print(f"Error in similar recipe recommendation: {str(e)}")
        return {
            'success': False,
            'message': f'Error: {str(e)}',
            'recommendations': []
        }


@app.route('/')
def home():
    """Homepage dengan informasi API"""
    return jsonify({
        "message": "Indonesian Food Recipe Recommendation API (Multiple Ingredients Support)",
        "version": "2.0",
        "features": [
            "Multiple ingredients support",
            "Ingredient normalization", 
            "Advanced filtering",
            "Similarity scoring",
            "Optimized for production"
        ],
        "endpoints": {
            "/recommend": "POST - Rekomendasi berdasarkan ingredients (single/multiple)",
            "/similar": "POST - Rekomendasi resep yang mirip",
            "/recipes": "GET - Daftar semua resep",
            "/categories": "GET - Daftar kategori dan kompleksitas",
            "/health": "GET - Health check"
        },
        "examples": {
            "single_ingredient": {
                "ingredients": "telur"
            },
            "multiple_ingredients": {
                "ingredients": ["telur", "bawang", "ayam"]
            },
            "with_filters": {
                "ingredients": ["telur", "cabai"],
                "min_rating": 4,
                "complexity_filter": "Cepat & Mudah",
                "top_n": 5
            }
        }
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": all([
            vectorizer is not None,
            cosine_sim_sparse is not None,
            recipes_df is not None,
            stemmer is not None,
            tfidf_matrix is not None
        ]),
        "total_recipes": len(recipes_df) if recipes_df is not None else 0,
        "features": {
            "multiple_ingredients": True,
            "ingredient_normalization": True,
            "advanced_filtering": True
        }
    })

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    """
    Endpoint untuk rekomendasi berdasarkan ingredients (single/multiple) - FIXED VERSION
    """
    try:
        # FIX: Better request validation
        if not request.is_json:
            return jsonify({
                "error": "Content-Type must be application/json",
                "received_content_type": request.content_type
            }), 400
            
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "Request body is empty or invalid JSON",
                "examples": {
                    "single": {"ingredients": "telur"},
                    "multiple": {"ingredients": ["telur", "bawang", "ayam"]}
                }
            }), 400
        
        if 'ingredients' not in data:
            return jsonify({
                "error": "Ingredients field is required",
                "received_fields": list(data.keys()) if isinstance(data, dict) else "Invalid data format",
                "examples": {
                    "single": {"ingredients": "telur"},
                    "multiple": {"ingredients": ["telur", "bawang", "ayam"]}
                }
            }), 400
        
        ingredients = data['ingredients']
        
        # FIX: Better input validation
        if ingredients is None:
            return jsonify({"error": "Ingredients cannot be null"}), 400
            
        if isinstance(ingredients, list):
            if len(ingredients) == 0:
                return jsonify({"error": "Ingredients list cannot be empty"}), 400
            # Check if all items in list are valid
            for item in ingredients:
                if not isinstance(item, (str, int, float)) or str(item).strip() == '':
                    return jsonify({"error": "All ingredients must be non-empty strings"}), 400
        elif isinstance(ingredients, str):
            if len(ingredients.strip()) == 0:
                return jsonify({"error": "Ingredients string cannot be empty"}), 400
        else:
            return jsonify({"error": "Ingredients must be a string or list of strings"}), 400
        
        # FIX: Safe parameter extraction with defaults
        try:
            top_n = int(data.get('top_n', 10))
            if top_n <= 0 or top_n > 50:  # Reasonable limits
                top_n = 10
        except (ValueError, TypeError):
            top_n = 10
            
        try:
            min_rating = float(data.get('min_rating')) if data.get('min_rating') is not None else None
        except (ValueError, TypeError):
            min_rating = None
            
        try:
            max_rating = float(data.get('max_rating')) if data.get('max_rating') is not None else None
        except (ValueError, TypeError):
            max_rating = None
            
        complexity_filter = data.get('complexity_filter')
        if complexity_filter is not None:
            complexity_filter = str(complexity_filter).strip()
            if complexity_filter == '':
                complexity_filter = None
        
        try:
            min_similarity = float(data.get('min_similarity', 0.05))
            if min_similarity < 0 or min_similarity > 1:
                min_similarity = 0.05
        except (ValueError, TypeError):
            min_similarity = 0.05
        
        print(f"🔍 Request params: ingredients={ingredients}, top_n={top_n}, min_rating={min_rating}")
        
        # Get recommendations
        result = recommend_from_ingredients(
            ingredients_list=ingredients,  # FIX: Menggunakan parameter name yang benar
            top_n=top_n,
            min_rating=min_rating,
            max_rating=max_rating,
            complexity_filter=complexity_filter,
            min_similarity=min_similarity
        )
        
        return jsonify({
            "status": "success" if result['success'] else "no_results",
            **result
        })
        
    except Exception as e:
        print(f"❌ Error in /recommend endpoint: {str(e)}")
        import traceback
        traceback.print_exc()  # FIX: Print full traceback untuk debugging
        return jsonify({
            "status": "error",
            "error": str(e),
            "message": "Terjadi kesalahan dalam pemrosesan request"
        }), 500

@app.route('/similar', methods=['POST'])
def get_similar_recipes():
    """Endpoint untuk rekomendasi resep yang mirip"""
    try:
        data = request.get_json()
        
        if not data or 'recipe_title' not in data:
            return jsonify({"error": "Recipe title is required"}), 400
        
        recipe_title = data['recipe_title'].strip()  # Strip whitespace
        top_n = data.get('top_n', 10)
        
        # Validasi top_n
        try:
            top_n = int(top_n)
            if top_n < 1 or top_n > 100:  # Set reasonable limits
                top_n = 10
        except (ValueError, TypeError):
            top_n = 10
        
        result = recommend_similar_recipes(recipe_title, top_n)
        
        return jsonify({
            "status": "success" if result['success'] else "error",
            **result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/recipes', methods=['GET'])
def get_all_recipes():
    """Endpoint untuk mendapatkan daftar semua resep"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        complexity = request.args.get('complexity')
        min_rating = request.args.get('min_rating', type=int)
        
        # Validate pagination
        if per_page > 100:
            per_page = 100  # Limit per_page to prevent memory issues
        
        # Filter berdasarkan parameter
        filtered_df = recipes_df.copy()
        
        if category:
            filtered_df = filtered_df[filtered_df['Category'].str.lower() == category.lower()]
        
        if complexity:
            filtered_df = filtered_df[filtered_df['Complexity'] == complexity]
            
        if min_rating:
            filtered_df = filtered_df[filtered_df['Rating'] >= min_rating]
        
        # Pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        paginated_recipes = filtered_df.iloc[start_idx:end_idx]
        
        # Convert to list of dicts
        recipes_list = []
        for _, row in paginated_recipes.iterrows():
            recipe = {
                'title': row['Title'],
                'category': row['Category'],
                'ingredients': row['Ingredients'] if pd.notna(row['Ingredients']) else '',
                'steps': row['Steps'] if pd.notna(row['Steps']) else '',
                'url': row['URL'] if pd.notna(row['URL']) else '',
                'rating': int(row['Rating']),
                'complexity': row['Complexity']
            }
            recipes_list.append(recipe)
        
        return jsonify({
            "status": "success",
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_recipes": len(filtered_df),
                "total_pages": (len(filtered_df) + per_page - 1) // per_page
            },
            "filters": {
                "category": category,
                "complexity": complexity,
                "min_rating": min_rating
            },
            "recipes": recipes_list
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    """Endpoint untuk mendapatkan daftar kategori"""
    try:
        categories = sorted(recipes_df['Category'].unique().tolist())
        complexities = sorted(recipes_df['Complexity'].unique().tolist())
        ratings = sorted(recipes_df['Rating'].unique().tolist())
        
        return jsonify({
            "status": "success",
            "categories": categories,
            "complexities": complexities,
            "ratings": ratings,
            "stats": {
                "total_recipes": len(recipes_df),
                "total_categories": len(categories),
                "avg_rating": round(float(recipes_df['Rating'].mean()), 2)
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Load optimized models saat startup
    if load_optimized_models():
        print("🚀 Server starting with multiple ingredients support...")
        print("📝 API supports both single and multiple ingredients input")
        print("🔧 Ready for production deployment")
        app.run(host='0.0.0.0', port=7860, debug=False)
    else:
        print("❌ Failed to load optimized models. Server tidak dapat dijalankan.")