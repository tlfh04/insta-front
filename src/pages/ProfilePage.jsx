import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, getUserPosts, follow, unfollow, getImageUrl } from '../api';
import PostGrid from '../components/PostGrid';
import '../styles/Profile.css';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [username]);

  const loadProfile = async () => {
    try {
      const response = await getProfile(username);
      setProfile(response.data.data);
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await getUserPosts(username);
      setPosts(response.data.data);
    } catch (error) {
      console.error('게시물 로드 실패:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || followLoading) return;
    setFollowLoading(true);

    try {
      if (profile.following) {
        await unfollow(username);
        setProfile((prev) => ({
          ...prev,
          following: false,
          followerCount: prev.followerCount - 1,
        }));
      } else {
        await follow(username);
        setProfile((prev) => ({
          ...prev,
          following: true,
          followerCount: prev.followerCount + 1,
        }));
      }
    } catch (error) {
      console.error('팔로우 처리 실패:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!profile) {
    return <div className="not-found">사용자를 찾을 수 없습니다.</div>;
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-image">
          {profile.profileImageUrl ? (
            <img src={getImageUrl(profile.profileImageUrl)} alt={profile.username} />
          ) : (
            <div className="default-avatar">{profile.username[0].toUpperCase()}</div>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-top">
            <h1>{profile.username}</h1>
            {currentUser && !isOwnProfile && (
              <button
                className={`follow-btn ${profile.following ? 'following' : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {profile.following ? '팔로잉' : '팔로우'}
              </button>
            )}
          </div>
          <div className="profile-stats">
            <span>
              게시물 <strong>{profile.postCount}</strong>
            </span>
            <span>
              팔로워 <strong>{profile.followerCount}</strong>
            </span>
            <span>
              팔로잉 <strong>{profile.followingCount}</strong>
            </span>
          </div>
          <div className="profile-bio">
            <strong>{profile.name}</strong>
            {profile.bio && <p>{profile.bio}</p>}
          </div>
        </div>
      </div>

      <div className="profile-posts">
        <PostGrid posts={posts} />
      </div>
    </div>
  );
};

export default ProfilePage;
