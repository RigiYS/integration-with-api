export type Film = {
  id: string;
  title: string;
  original_title: string;
  description: string;
  director: string;
  producer: string;
  release_date: string; 
  running_time: string; 
  rt_score: string;     
  image?: string;       
  movie_banner?: string;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  playlist?: string;
  score: number;
  image: string;
  mediaId: string; 
};

type OpenWhydPost = {
    _id: string;
    name: string; 
    uId: string; 
    eId: string; 
    img: string; 
    score: number;
    pl?: {
        name: string;
    };
};

export async function getFilms(): Promise<Film[]> {
  const res = await fetch(`https://ghibliapi.vercel.app/films`);
  if (!res.ok) throw new Error('Failed to fetch films');
  return res.json();
}

export async function getFilmById(id: string): Promise<Film> {
  const res = await fetch(`https://ghibliapi.vercel.app/films/${id}`);
  if (!res.ok) throw new Error('Failed to fetch film');
  return res.json();
}

export async function getSongs(): Promise<Song[]> {
  const proxyUrl = 'https://api.allorigins.win/get?url=';
  const targetUrl = 'https://openwhyd.org/hot/electro?format=json';
  
  const res = await fetch(`${proxyUrl}${encodeURIComponent(targetUrl)}`);

  if (!res.ok) throw new Error('Failed to fetch songs from OpenWhyd');
  
  const jsonResponse = await res.json();
  const data = JSON.parse(jsonResponse.contents);

  const rawPosts: OpenWhydPost[] = data.posts || [];
  
  return rawPosts.map(post => {
    const nameParts = post.name.split(' - ');
    let artist = nameParts.length > 1 ? nameParts[0].trim() : 'Unknown Artist';
    let title = nameParts.length > 1 ? nameParts.slice(1).join(' - ').trim() : post.name.trim();

    return {
      id: post._id,
      title: title,
      artist: artist,
      playlist: post.pl?.name || 'Unknown Playlist',
      score: post.score || 0,
      image: post.img,
      mediaId: post.eId,
    };
  });
}