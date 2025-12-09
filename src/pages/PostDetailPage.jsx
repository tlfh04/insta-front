import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, deletePost } from '../api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import '../styles/PostDetail.css';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const response = await getPost(id);
      setPost(response.data.data);
    } catch (error) {
      console.error('게시물 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  const handleDelete = async () => {
    if (window.confirm('게시물을 삭제하시겠습니까?')) {
      try {
        await deletePost(id);
        navigate('/');
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!post) {
    return <div className="not-found">게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="post-detail-container">
      <PostCard
        post={post}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        showComments={true}
      />
    </div>
  );
};

export default PostDetailPage;
