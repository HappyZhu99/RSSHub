import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';

const ieeeHost = 'https://ieeexplore.ieee.org';

export const route: Route = {
    name: 'IEEE Journal Articles and Preprints',
    maintainers: ['HappyZhu99'],
    categories: ['journal'],
    path: '/journal/:punumber/mix',
    parameters: {
        punumber: 'Publication Number, look for `punumber` in the URL',
    },
    example: '/ieee/journal/6287639/mix',
    handler,
};

async function handler(ctx) {
    const publicationNumber = ctx.req.param('punumber');

    const metadata = await fetchMetadata(publicationNumber);
    const { displayTitle, currentIssue, preprintIssue, coverImagePath } = metadata;
    const { issueNumber, volume, issue, publicationDateAsStr } = currentIssue;

    const preIssueNumber = preprintIssue.issueNumber;

    const tocData = await fetchTOCData(publicationNumber, issueNumber);
    const preTocData = await fetchTOCData(publicationNumber, preIssueNumber);

    if (tocData.totalPages > 1) {
        const tocPages = Array.from({ length: tocData.totalPages - 1 }, (_, index) => index + 2);
        const tocResponses = await Promise.all(tocPages.map((pageNumber) => fetchTOCData(publicationNumber, issueNumber, pageNumber)));
        tocData.records = tocData.records.concat(tocResponses.flatMap((response) => response.records));
    }

    if (preTocData.totalPages > 1) {
        const prePages = Array.from({ length: preTocData.totalPages - 1 }, (_, index) => index + 2);
        const preResponses = await Promise.all(prePages.map((pageNumber) => fetchTOCData(publicationNumber, preIssueNumber, pageNumber)));
        preTocData.records = preTocData.records.concat(preResponses.flatMap((response) => response.records));
    }

    const cuList = tocData.records.map((item) => mapRecordToItem(volume, issue, publicationDateAsStr)(item));

    const preList = preTocData.records.map((item) => mapRecordToItem('Preprint', 99, 'Preprint')(item));

    const list = cuList.concat(preList);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(`https://ieeexplore.ieee.org${item.link}`);

                const $ = load(response);

                const target = $('script[type="text/javascript"]:contains("xplGlobal.document.metadata")');
                const code = target.text() || '';

                // 捕获等号右侧的 JSON（最小匹配直到紧随的分号）
                const m = code.match(/xplGlobal\.document\.metadata\s*=\s*(\{[\s\S]*?\})\s*;/);
                const metadata = m ? (JSON.parse(m[1]) as { abstract?: string; displayPublicationDate?: string }) : null;
                item.abstract = metadata?.abstract ?? ' ';
                item.pubDate = metadata?.displayPublicationDate ? parseDate(metadata.displayPublicationDate) : undefined;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    item,
                });

                return item;
            })
        )
    );

    return {
        title: displayTitle,
        link: `${ieeeHost}/xpl/tocresult.jsp?isnumber=${issueNumber}`,
        item: items,
        image: `${ieeeHost}${coverImagePath}`,
    };
}

async function fetchMetadata(punumber) {
    const response = await got(`${ieeeHost}/rest/publication/home/metadata?pubid=${punumber}`);
    return response.data;
}

async function fetchTOCData(punumber, isnumber, pageNumber = 1) {
    const response = await got.post(`${ieeeHost}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, {
        json: { punumber, isnumber, rowsPerPage: '100', pageNumber },
    });
    return response.data;
}

function mapRecordToItem(volume, issue, publicationDateAsStr) {
    return (item) => ({
        abstract: item.abstract || '',
        authors: item.authors ? item.authors.map((author) => author.preferredName).join('; ') : '',
        description: '',
        doi: item.doi,
        link: item.htmlLink,
        title: item.articleTitle || '',
        volume,
        issue,
        publicationDateAsStr,
    });
}
