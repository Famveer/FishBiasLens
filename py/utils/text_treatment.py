import re

# Based on
# https://towardsdatascience.com/text-normalization-with-spacy-and-nltk-1302ff430119
# and
# https://www.kaggle.com/code/nilaychauhan/getting-started-with-nlp-pipelines

# Processamento de texto (PDF submetidos)
class spaCyProcess:
    """Full text preprocessing with spaCy."""
    def __init__(self, n_jobs=1):
        self.n_jobs = n_jobs
        self.create_nlp()

    def create_nlp(self):
        """Create spaCy's NLP object.

        We disable almost all of the default spaCy pipeline components to
        speed up the text processing.
        """
        try:
            import pt_core_news_sm
        except:
            import spacy
            spacy.cli.download("pt_core_news_sm") # Portuguese
            import pt_core_news_sm
        nlp = pt_core_news_sm.load()
        self.nlp = pt_core_news_sm.load(disable=nlp.pipe_names)
        self.nlp.enable_pipe('lemmatizer')
        self.nlp.max_length = 10000000

    def process_texts(self, texts):
        """Full text preprocessing.

        Args:
            texts (list of str): List of texts to be preprocessed.

        Returns:
            list of str: List of preprocessed texts.
        """
        texts = [self.normalize(text) for text in texts]
        processed_texts = []
        for doc in self.nlp.pipe(texts, n_process=self.n_jobs):
            # Filter stop_words and lemmatize
            filtered_tokens = [token.lemma_ for token in doc 
                               if not token.is_stop]
            processed_texts.append(" ".join(filtered_tokens))
        return processed_texts
    
    def normalize(self, text):
        """Normalize the text.

        Remove unwanted characters and lower the text.

        Args:
            text (str): Text to be normalized.

        Returns:
            str: Normalized text.
        """
        text = text.lower()

        # Remove the dot from "1.035", "1.029", "705.140"
        # but not from "a.a" or "21.02.2023"
        text = re.sub(r"(?<!\.)\b(\d)+\.(\d{3})\b(?!\.\d)", r"\1\2", text)

        # Remove strange characters
        text = re.sub(r"[^a-záàãâéêèíîìóôòõúûùüç\dº§]", " ", text)

        # Remove long numbers
        text = re.sub(r"\b\d{12,}\b", " ", text)

        # Remove extra spaces
        text = re.sub(r"\s+", " ", text)

        return text

class TextProcess(spaCyProcess):
    """Text cleaning and preprocessing."""
    def clean_and_process_texts(self, texts):
        """Clean the texts and therefore process them using `spaCyProcess`.

        Args:
            texts (list of str): List of texts to be preprocessed.
        """
        texts = self.clean_texts(texts)
        return self.process_texts(texts)

    def clean_texts(self, texts):
        """Remove "ENDOFPAGE" and "Impresso por: ..." from the texts.

        Args:
            texts (list of str): Texts to be cleaned.

        Returns:
            list of str: Cleaned texts.
        """
        return [self.clean_text(text) for text in texts]

    def clean_text(self, text):
        """Remove "ENDOFPAGE" and "Impresso por: ..." from the text.

        Args:
            text (str): Text to be cleaned.

        Returns:
            str: Cleaned text.
        """
        text = self.remove_endofpage(text)
        text = self.remove_watermark(text)
        return text

    def remove_endofpage(self, text):
        """Remove "ENDOFPAGE" from the text.

        Args:
            text (str): Text to be cleaned.

        Returns:
            str: Cleaned text.
        """
        text = text.replace("\nENDOFPAGE\n", "")
        return text

    def remove_watermark(self, text):
        """Remove "Impresso por: ..." from the text.

        Args:
            text (str): Text to be cleaned.

        Returns:
            str: Cleaned text.
        """
        rule = "Impresso por: \d{3}.\d{3}.\d{3}-\d{2} .{0,25}\nEm: \d{2}/\d{2}/\d{4} - \d{2}:\d{2}:\d{2}\n"
        text = re.sub(rule, "", text)
        return text
