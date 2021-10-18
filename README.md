# Masader 
The first online catalogue for Arabic NLP datasets. This catalogue contains 200 datasets with more than 25 metadata annotations for each dataset. You can view the list of all datasets using the link of the webiste [https://arbml.github.io/masader/](https://arbml.github.io/masader/)

> **Title** Masader: Metadata Sourcing for Arabic Text and Speech Data Resources <br>
> Authors Zaid Alyafeai, Maraim Masoud, Mustafa Ghaleb, Maged S. Al-shaibani <br>
> https://arxiv.org/abs/2110.06744
>
> **Abstract:** The NLP pipeline has evolved dramatically in the last few years. The first step in the pipeline is to find suitable annotated datasets to evaluate the tasks we are trying to solve. Unfortunately, most of the published datasets lack metadata annotations that describe their attributes. Not to mention, the absence of a public catalogue that indexes all the publicly available datasets related to specific regions or languages. When we consider low-resource dialectical languages, for example, this issue becomes more prominent. In this paper we create \textit{Masader}, the largest public catalogue for Arabic NLP datasets, which consists of 200 datasets annotated with 25 attributes. Furthermore, We develop a metadata annotation strategy that could be extended to other languages. We also make remarks and highlight some issues about the current status of Arabic NLP datasets and suggest recommendations to address them.*

## Metadata 

* `No.` dataset number
* `Name` name of the dataset 
* `Subsets` subsets of the datasets
* `Link` direct link to the dataset or instructions on how to download it 
* `License` license of the dataset 
* `Year` year of the publishing the dataset/paper
* `Language` ar or multilingual 
* `Dialect` region ar-LEV: (Arabic(Levant)), country ar-EGY: (Arabic (Egypt)) or type ar-MSA: (Arabic (Modern Standard Arabic))
* `Domain` social media, news articles, reviews, commentary, books, transcribed audio or other
* `Form` text, audio or sign language 
* `Collection style` crawling, crawling and annotation (translation), crawling and annotation (other), machine translation, human translation, human curation or other
* `Description` short statement describing the dataset
* `Volume` the size of the dataset in numbers
* `Unit` unit of the volume, could be tokens, sentences, documents, MB, GB, TB, hours or other
* `Provider` company or university providing the dataset 
* `Related Datasets` any datasets that is related in terms of content to the dataset
* `Paper Title` title of the paper 
* `Paper Link` direct link to the paper pdf 
* `Script` writing system either Arab, Latn, Arab-Latn or other
* `Tokenized` whether the dataset is segmented using morphology: Yes or No 
* `Host` the host website for the data i.e GitHub 
* `Access` is the data free, upon-request or with-fee.
* `Cost` cost of the data is with-fee. 
* `Test split` does the data contain test split: Yes or No
* `Tasks` the tasks included in the dataset spearated by comma
* `Evaluation Set` is the data included in the evaluation suit by BigScience 
* `Venue Title` the venue title i.e ACL
* `Citations` the number of citations 
* `Venue Type` conference, workshop, journal or preprint 
* `Venue Name` full name of the venue i.e Associations of computation linguistics 
* `authors` list of the paper authors separated by comma 
* `affiliations` list of the paper authors' affiliations separated by comma
* `abstract` abstract of the paper 
* `Added by` name of the person who added the entry 
* `Notes` any extra notes on the dataset
 

## Contribution 
The catalogue will be updated regularly. If you want to add a new dataset feel free to follow the instructions and update the [sheet](https://docs.google.com/spreadsheets/d/11ZBav_z0IAXlKmvoEAGRq-ZdobgP5boYtbvtK3YWVqo/edit?usp=sharing).

## Collaborative Work

Masader was developed as part of the [BigScience project for open research 🌸](https://bigscience.huggingface.co/), a year-long initiative targeting the study of large models and datasets. The goal of the project is to research language models in a public environment outside large technology companies. The project has more than 700 researchers from 50 countries and more than 250 institutions. Mainly, we conducted the research as part of the data sourcing working group which is responsible for collecting sources for multilple languages. 

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

