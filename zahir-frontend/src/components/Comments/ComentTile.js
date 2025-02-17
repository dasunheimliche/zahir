import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getCurrentUser } from '../../services/userServices';
import {
  fetchSubComments,
  deleteComment,
} from '../../services/commentServices';

import Comment from './Comment';

import style from '../../styles/comments.module.css';

export default function CommentTile({ post, comment, onTargetUserComment }) {
  const [isMutating, setIsMutating] = useState(false);

  const { data: { data: user } = {} } = useQuery({
    queryKey: ['ME'],
    queryFn: getCurrentUser,
  });
  const { data: { data: subComments } = {} } = useQuery({
    queryKey: ['GET_SUBCOMMENTS', comment.id],
    queryFn: () => fetchSubComments(comment),
  });

  const client = useQueryClient();

  const { mutate: handleDeleteComment } = useMutation({
    mutationFn: deleteComment,
    onMutate: () => setIsMutating(true),
    onSuccess: (_, variables) => {
      if (variables.comment.commentID) {
        client.setQueryData(['GET_SUBCOMMENTS', comment.id], (old) => {
          const copy = { ...old };
          copy.data = copy.data.filter((c) => c.id !== variables.comment.id);
          return copy;
        });
      } else {
        client.setQueryData(['GET_COMMENTS', post.id], (old) => {
          const copy = { ...old };
          copy.data = copy.data.filter((c) => c.id !== variables.comment.id);
          return copy;
        });
      }

      setIsMutating(false);
    },
  });

  const loadSubcomments = () => {
    if (!subComments) return;
    return subComments.map((comment0, i) => {
      return (
        <Comment
          key={i}
          comment={comment0}
          user={user}
          post={post}
          isMutating={isMutating}
          onAnswerComment={() =>
            onTargetUserComment(comment.id, comment0.username)
          }
          onDeleteComment={() =>
            handleDeleteComment({ post, comment: comment0 })
          }
        />
      );
    });
  };

  return (
    <div className={style['comment-container']}>
      <Comment
        key={comment.id}
        comment={comment}
        user={user}
        post={post}
        isMutating={isMutating}
        onAnswerComment={() =>
          onTargetUserComment(comment.id, comment.username)
        }
        onDeleteComment={() => handleDeleteComment({ post, comment: comment })}
      />
      <div className={style.subComments}>
        {subComments && loadSubcomments()}
      </div>
    </div>
  );
}
