//get

//getInstagramIdQuery
module.exports.getInstagramIdQuery = function (id) {
    const query = 'SELECT * FROM instagramId WHERE id =\'' + id + '\''
    return query;
}

//getJsonFromFile
module.exports.getNotPostedRelatedPostsQuery = function (id) {
    const query = `
    SELECT postUrl, postText, pk
    FROM
        -- 아이디와 관련된 모든 포스트
        (SELECT postUrl, postText, pk, id
        FROM idRelatedPosts
            WHERE id = '`+ id + `') idRelatedPosts
    LEFT JOIN
        -- 아이디에서 이전에 포스팅된 포스트
        (SELECT postPk
    FROM idPostedPosts
    LEFT JOIN instagramId ON instagramId.pk = idPostedPosts.instagramIdPk
    WHERE instagramId.id = '`+ id + `') idPostedPosts
    ON idRelatedPosts.pk = idPostedPosts.postPk
        -- 차집합 병합
    WHERE idPostedPosts.postPk IS NULL;`
    return query;
}