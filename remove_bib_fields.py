"""This script removes any abstract, note and file fields from bibtex entries in the radiovoltaics-bibliography.bib file."""

import bibtexparser
from bibtexparser.bwriter import BibTexWriter
from bibtexparser.bparser import BibTexParser
def remove_fields_from_bibtex(input_bibtex_path, output_bibtex_path):
    with open(input_bibtex_path, 'r', encoding='utf-8') as bibtex_file:
        bib_database = bibtexparser.load(bibtex_file, parser=BibTexParser(common_strings=True))

    for entry in bib_database.entries:
        entry.pop('abstract', None)
        entry.pop('note', None)
        entry.pop('file', None)

    writer = BibTexWriter()
    with open(output_bibtex_path, 'w', encoding='utf-8') as output_file:
        output_file.write(writer.write(bib_database))
if __name__ == "__main__":
    input_bibtex = 'radiovoltaics-bibliography.bib'
    output_bibtex = 'radiovoltaics-bibliography.bib'
    remove_fields_from_bibtex(input_bibtex, output_bibtex)
    