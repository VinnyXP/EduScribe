import os
import pandas as pd
import json

PARQUET_FILE = 'train-main.parquet'
OUTPUT_FILE = 'dataset-cleaned-final.jsonl'
DATASET_SIZE = 200

def get_df_from_parquet(parquet_file):
    assert(os.path.exists(parquet_file))
    """Read a parquet file into a pandas DataFrame"""
    return pd.read_parquet(parquet_file)

def get_texts_and_summaries(df):
    """Get the texts and summaries from the DataFrame"""
    assert(df is not None)
    texts = df['text'].tolist()
    summaries = df['summary'].tolist()
    return texts, summaries

def write_to_file(texts: list[str], summaries: list[str], output_file):
    """Write the texts and summaries to a file"""
    assert(len(texts) >= DATASET_SIZE)
    with open(output_file, 'w', encoding='utf-8') as f:
        count = 0
        for text, summary in zip(texts, summaries):
            if count >= DATASET_SIZE:
                break
            if not text or not summary:
                continue
            if len(text) > 5000 or len(summary) > 5000:
                continue
            # clean summaries
            if summary.startswith('\u2013'):
                summary = summary[1:]
            # remove leading and trailing whitespace
            text = text.strip()
            summary = summary.strip()
            if summary[0].islower():
                # Make the first letter of the summary uppercase
                summary = summary[0].upper() + summary[1:]
            if not text or not summary:
                continue
            
            count += 1
            entry = f"Transcript:\n{text}\n#END\nSummary:\n{summary}\n#END"
            data = {"text" : entry}
            json.dump(data, f, ensure_ascii=False)
            f.write('\n')

def main():
    parquet_file = PARQUET_FILE
    df = get_df_from_parquet(parquet_file)
    texts, summaries = get_texts_and_summaries(df)
    output_file = OUTPUT_FILE
    write_to_file(texts, summaries, output_file)

if __name__ == '__main__':
    main()