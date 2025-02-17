import style from '../../styles/post.module.css';

const SharedVideoPost = ({ post, p }) => {
  let idVideo;
  if (post.videoPost.startsWith('https://www.youtube.com/watch?')) {
    idVideo = post.videoPost.replace('https://www.youtube.com/watch?v=', '');
  } else if (post.videoPost.startsWith('https://youtu.be/')) {
    idVideo = post.videoPost.replace('https://youtu.be/', '');
  }

  const urlVideo = `https://www.youtube.com/embed/${idVideo}?playlist=${idVideo}&loop=1`;

  let aspectr = post.videoAr.split(':');
  let width = Number(aspectr[1]);
  let height = Number(aspectr[0]);
  let ar = (width / height) * 100;
  let defaultAr = (9 / 16) * 100;

  return (
    <div
      className={`${style.post} ${style.figure} ${style.shadows} ${style['mobile-post']}`}>
      <div className={style.user}>
        <div className={style['user-profile']}>
          <img
            className={style['profile-image']}
            src={post.profileImg}
            alt="profile img"></img>
        </div>
        <div>@{post.username}</div>
      </div>

      <div className={style['video-post']}>
        <div
          className={style['video-container']}
          style={{ paddingBottom: `${ar ? ar : defaultAr}%` }}>
          <iframe
            title="youtube video post"
            style={{ width: '100%', height: '100%' }}
            src={urlVideo}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen></iframe>
        </div>
      </div>
      <div className={style.footer}>
        <div className={style['footer-header']}>
          <i>{post.title}</i> {post.title && post.subtitle ? '-' : ''}{' '}
          <b>{post.subtitle}</b>
        </div>
        <div className={style['footer-middle']}></div>
        <div className={style['footer-icons']}>
          <div></div>
          <div className={style['social-icons']}>
            <span
              onClick={p.doNothing}
              className={`${style.icon} ${style.notliked} p`}></span>
            <span
              className={`${style.icon} ${style.comment} p`}
              onClick={p.doNothing}></span>
            <span
              className={`${style.icon} ${style.share} p`}
              onClick={p.doNothing}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedVideoPost;
