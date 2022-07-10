# Masader

<p align="center">
<img src = "https://user-images.githubusercontent.com/15667714/164975879-d23766e2-4ed9-4ac3-b793-31565e032cce.png" width = "300px"/>
</p>

The first online catalogue for Arabic NLP datasets. This catalogue contains 200 datasets with more than 25 metadata annotations for each dataset. You can view the list of all datasets using the link of the webiste [https://arbml.github.io/masader/](https://arbml.github.io/masader/)

> **Title** Masader: Metadata Sourcing for Arabic Text and Speech Data Resources <br>
> Authors Zaid Alyafeai, Maraim Masoud, Mustafa Ghaleb, Maged S. Al-shaibani <br> > https://arxiv.org/abs/2110.06744
>
> **Abstract:** The NLP pipeline has evolved dramatically in the last few years. The first step in the pipeline is to find suitable annotated datasets to evaluate the tasks we are trying to solve. Unfortunately, most of the published datasets lack metadata annotations that describe their attributes. Not to mention, the absence of a public catalogue that indexes all the publicly available datasets related to specific regions or languages. When we consider low-resource dialectical languages, for example, this issue becomes more prominent. In this paper we create \textit{Masader}, the largest public catalogue for Arabic NLP datasets, which consists of 200 datasets annotated with 25 attributes. Furthermore, We develop a metadata annotation strategy that could be extended to other languages. We also make remarks and highlight some issues about the current status of Arabic NLP datasets and suggest recommendations to address them.\*

## Metadata

-   `No.` dataset number
-   `Name` name of the dataset
-   `Subsets` subsets of the datasets
-   `Link` direct link to the dataset or instructions on how to download it
-   `License` license of the dataset
-   `Year` year of the publishing the dataset/paper
-   `Language` ar or multilingual
-   `Dialect` region ar-LEV: (Arabic(Levant)), country ar-EGY: (Arabic (Egypt)) or type ar-MSA: (Arabic (Modern Standard Arabic))
-   `Domain` social media, news articles, reviews, commentary, books, transcribed audio or other
-   `Form` text, audio or sign language
-   `Collection style` crawling, crawling and annotation (translation), crawling and annotation (other), machine translation, human translation, human curation or other
-   `Description` short statement describing the dataset
-   `Volume` the size of the dataset in numbers
-   `Unit` unit of the volume, could be tokens, sentences, documents, MB, GB, TB, hours or other
-   `Provider` company or university providing the dataset
-   `Related Datasets` any datasets that is related in terms of content to the dataset
-   `Paper Title` title of the paper
-   `Paper Link` direct link to the paper pdf
-   `Script` writing system either Arab, Latn, Arab-Latn or other
-   `Tokenized` whether the dataset is segmented using morphology: Yes or No
-   `Host` the host website for the data i.e GitHub
-   `Access` the data is either free, upon-request or with-fee.
-   `Cost` cost of the data is with-fee.
-   `Test split` does the data contain test split: Yes or No
-   `Tasks` the tasks included in the dataset spearated by comma
-   `Evaluation Set` the data included in the evaluation suit by BigScience
-   `Venue Title` the venue title i.e ACL
-   `Citations` the number of citations
-   `Venue Type` conference, workshop, journal or preprint
-   `Venue Name` full name of the venue i.e Associations of computation linguistics
-   `authors` list of the paper authors separated by comma
-   `affiliations` list of the paper authors' affiliations separated by comma
-   `abstract` abstract of the paper
-   `Added by` name of the person who added the entry
-   `Notes` any extra notes on the dataset

## Access Data

You can access the annoated dataset using `datasets`

```python
from datasets import load_dataset
masader = load_dataset('arbml/masader')
masader['train'][0]
```

which gives the following output

```
{'Abstract': 'Modern Standard Arabic (MSA) is the official language used in education and media across the Arab world both in writing and formal speech. However, in daily communication several dialects depending on the country, region as well as other social factors, are used. With the emergence of social media, the dialectal amount of data on the Internet have increased and the NLP tools that support MSA are not well-suited to process this data due to the difference between the dialects and MSA. In this paper, we construct the Shami corpus, the first Levantine Dialect Corpus (SDC) covering data from the four dialects spoken in Palestine, Jordan, Lebanon and Syria. We also describe rules for pre-processing without affecting the meaning so that it is processable by NLP tools. We choose Dialect Identification as the task to evaluate SDC and compare it with two other corpora. In this respect, experiments are conducted using different parameters based on n-gram models and Naive Bayes classifiers. SDC is larger than the existing corpora in terms of size, words and vocabularies. In addition, we use the performance on the Language Identification task to exemplify the similarities and differences in the individual dialects.',
 'Access': 'Free',
 'Added By': 'nan',
 'Affiliations': ',The Islamic University of Gaza,,',
 'Authors': 'Chatrine Qwaider,Motaz Saad,S. Chatzikyriakidis,Simon Dobnik',
 'Citations': '25.0',
 'Collection Style': 'crawling and annotation(other)',
 'Cost': 'nan',
 'Derived From': 'nan',
 'Description': 'the first Levantine Dialect Corpus (SDC) covering data from the four dialects spoken in Palestine, Jordan, Lebanon and Syria.',
 'Dialect': 'ar-LEV: (Arabic(Levant))',
 'Domain': 'social media',
 'Ethical Risks': 'Medium',
 'Form': 'text',
 'Host': 'GitHub',
 'Language': 'ar',
 'License': 'Apache-2.0',
 'Link': 'https://github.com/GU-CLASP/shami-corpus',
 'Name': 'Shami',
 'Paper Link': 'https://aclanthology.org/L18-1576.pdf',
 'Paper Title': 'Shami: A Corpus of Levantine Arabic Dialects',
 'Provider': 'Multiple institutions ',
 'Script': 'Arab',
 'Subsets': [{'Dialect': 'ar-JO: (Arabic (Jordan))',
   'Name': 'Jordanian',
   'Unit': 'sentences',
   'Volume': '32,078'},
  {'Dialect': 'ar-PS: (Arabic (Palestinian Territories))',
   'Name': 'Palestanian',
   'Unit': 'sentences',
   'Volume': '21,264'},
  {'Dialect': 'ar-SY: (Arabic (Syria))',
   'Name': 'Syrian',
   'Unit': 'sentences',
   'Volume': '48,159'},
  {'Dialect': 'ar-LB: (Arabic (Lebanon))',
   'Name': 'Lebanese',
   'Unit': 'sentences',
   'Volume': '16,304'}],
 'Tasks': 'dialect identification',
 'Test Split': 'No',
 'Tokenized': 'No',
 'Unit': 'sentences',
 'Venue Name': 'International Conference on Language Resources and Evaluation',
 'Venue Title': 'LREC',
 'Venue Type': 'conference',
 'Volume': '117,805',
 'Year': 2018}
```

## Running MASADER locally with Jekyll

### Prerequisites:

1.  Install [Ruby](https://www.ruby-lang.org/en/documentation/installation/).
2.  Install [bundle](https://bundler.io).
3.  Install [Jekyll](https://jekyllrb.com/docs/installation/).

### Steps:

1.  Open Project in the Terminal
2.  Run `bundle install` to install the project's dependencies.
3.  Run the site locally with `bundle exec jekyll serve`.
4.  To preview MASADER site, in your web browser, navigate to `http://127.0.0.1:4000/masader/` .

Note: Navigate to the publishing source for MASADER site. For more information about publishing sources, [see](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#publishing-sources-for-github-pages-sites).

## Contribution

The catalogue will be updated regularly. If you want to add a new dataset, use this [form](https://forms.gle/JnMrJjHumT6ktK9cA).

## Collaborative Work

Masader was developed as part of the [BigScience project for open research 🌸](https://bigscience.huggingface.co/), a year-long initiative targeting the study of large langauge models and datasets. The goal of the project is to research language models in a public environment outside large technology companies. The project has more than 700 researchers from 50 countries and more than 250 institutions. Mainly, we conducted the research as part of the data sourcing working group which is responsible for collecting sources for multilple languages.

## Citation

```
@misc{alyafeai2021masader,
      title={Masader: Metadata Sourcing for Arabic Text and Speech Data Resources},
      author={Zaid Alyafeai and Maraim Masoud and Mustafa Ghaleb and Maged S. Al-shaibani},
      year={2021},
      eprint={2110.06744},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```
