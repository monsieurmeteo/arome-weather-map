
import React, { useState } from 'react';
import archivesData from '../../data/foudre_archives_list.json';
import { Calendar, Download, Eye, Image as ImageIcon, X } from 'lucide-react';
import './FoudreGallery.css';

export default function FoudreGallery() {
    const [selectedImg, setSelectedImg] = useState(null);

    // Trier les archives par date décroissante
    const sortedArchives = [...archivesData].sort((a, b) => b.Name.localeCompare(a.Name));

    return (
        <div className="foudre-gallery">
            <header className="gallery-header">
                <ImageIcon size={32} color="#fbbf24" />
                <div>
                    <h1>Archives Cartographiques Foudre</h1>
                    <p>Retrouvez vos bilans orageux exportés</p>
                </div>
            </header>

            <div className="gallery-grid">
                {sortedArchives.map((archive) => {
                    const datePart = archive.Name.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'Inconnue';
                    return (
                        <div key={archive.Name} className="gallery-card" onClick={() => setSelectedImg(archive.Name)}>
                            <div className="card-preview">
                                <img src={`/archives-foudre/${archive.Name}`} alt={archive.Name} loading="lazy" />
                                <div className="card-overlay">
                                    <Eye size={24} />
                                </div>
                            </div>
                            <div className="card-info">
                                <Calendar size={14} />
                                <span>{datePart}</span>
                                <a
                                    href={`/archives-foudre/${archive.Name}`}
                                    download
                                    className="download-link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download size={14} />
                                </a>
                            </div>
                        </div>
                    );
                })}
                {sortedArchives.length === 0 && (
                    <div className="empty-gallery">
                        <ImageIcon size={48} opacity={0.2} />
                        <p>Aucune archive trouvée dans /public/archives-foudre/</p>
                    </div>
                )}
            </div>

            {selectedImg && (
                <div className="gallery-modal" onClick={() => setSelectedImg(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedImg(null)}><X size={24} /></button>
                        <img src={`/archives-foudre/${selectedImg}`} alt="Fullscreen" />
                        <div className="modal-footer">
                            <h3>Bilan Foudre du {selectedImg.match(/\d{4}-\d{2}-\d{2}/)?.[0]}</h3>
                            <a href={`/archives-foudre/${selectedImg}`} download className="btn-download">
                                <Download size={18} /> Télécharger l'image HD
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
