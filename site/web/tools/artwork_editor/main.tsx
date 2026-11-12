import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '../../app/globals.css';
import './editor.css';
import ArtworkEditor from './editor';

const root=document.getElementById('root');
if(!root)throw new Error('Artwork editor root is missing');
createRoot(root).render(<StrictMode><ArtworkEditor/></StrictMode>);
