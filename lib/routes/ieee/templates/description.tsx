import { renderToString } from 'hono/jsx/dom/server';

type DescriptionItem = {
    title: string;
    authors: string;
    doi: string;
    volume?: string | number;
    issue?: string | number;
    abstract: string;
    pubDate?: string | Date;
    publicationDateAsStr?: string;
};

export const renderDescription = (item: DescriptionItem): string =>
    renderToString(
        <>
            <p>
                <span>
                    <big>{item.title}</big>
                </span>
                <br />
            </p>
            <p>
                <span>
                    <small>
                        <i>{item.authors}</i>
                    </small>
                </span>
                <br />
                <span>
                    <small>
                        <i>
                            <a href={`https://doi.org/${item.doi}`}>https://doi.org/{item.doi}</a>
                        </i>
                    </small>
                </span>
                <br />
                <span>
                    <small>
                        <i>
                            Volume {item.volume ?? ''}, Issue {item.issue ?? ''}
                        </i>
                    </small>
                </span>
                <br />
                <span>
                    <small>
                        <i>Published Date: {item.pubDate ? String(item.pubDate) : ''}</i>
                    </small>
                </span>
                <br />
                <span>
                    <small>
                        <i>Issue Date: {item.publicationDateAsStr ?? ''}</i>
                    </small>
                </span>
                <br />
            </p>
            <p>
                <span>{item.abstract}</span>
                <br />
            </p>
        </>
    );
