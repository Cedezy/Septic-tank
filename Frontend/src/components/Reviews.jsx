import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { Star } from 'lucide-react';
import Loading from './Loading';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try{
                const response = await axios.get('/review');
                const filtered = response.data.reviews.filter(
                    (r) => r.approved && r.visible
                );
                setReviews(filtered);
            } 
            catch(err){
                console.log(err);
            } 
            finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if(loading){
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Loading/>
            </div>
        );
    }

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <div className="bg-gray-50 pt-28 pb-20">
            <div className="pb-10">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h1 className="text-4xl md:text-5xl text-gray-800 mb-6 uppercase tracking-tight">
                        Customer Reviews
                    </h1>
                    <p className="text-s, text-gray-600 leading-relaxed">
                        See what our satisfied customers have to say about their experience with our septic services. From start to finish, we prioritize professionalism, reliability, and top-notch care.
                    </p>
                </div>
            </div>
            <div className='max-w-5xl mx-auto'>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reviews.length === 0 ? (
                        <p className="text-center text-gray-500 col-span-full">No reviews yet.</p>
                    ) : (
                        reviews.map((review, index) => (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-center mb-2">
                                    {renderStars(review.rating)}
                                </div>
                                <p className="text-gray-700 italic mb-3">"{review.comment}"</p>
                                <p className="text-sm text-gray-500">
                                    — {review?.customerId?.fullname || 'Anonymous'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
