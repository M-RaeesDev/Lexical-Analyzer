function analyze() {
    const input = document.getElementById('input').value;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const tokensDiv = document.getElementById('tokens');
    tokensDiv.innerHTML = '';
    tokens.forEach(token => {
        const tokenElement = document.createElement('span');
        tokenElement.textContent = `${token.type}: ${token.value}`;
        tokenElement.classList.add('token');
        tokensDiv.appendChild(tokenElement);
    });
}

document.getElementById('clearBtn').addEventListener('click', function() {
    document.getElementById('tokens').innerHTML = '';
    document.getElementById('input').innerHTML = '';
});


class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
    }

    peek(offset = 0) {
        return this.position + offset < this.input.length ? this.input[this.position + offset] : null;
    }

    advance() {
        this.position++;
    }

    isWhiteSpace(c) { return /\s/.test(c); }
    isDigit(c) { return /[0-9]/.test(c); }
    isLetter(c) { return /[a-zA-Z_$]/.test(c); }
    isIdentifierChar(c) { return /[a-zA-Z0-9_$]/.test(c); }

    lex() {
        const tokens = [];
        const keywords = [
            "if","else","while","for","function","return","var","let","const",
            "switch","case","break","continue","default","do","try","catch","finally",
            "throw","class","extends","import","export","new","this","super","typeof","instanceof"
        ];
        const operators = [
            "++","--","==","===","!=","!==","<=",">=","&&","||",
            "+","-","*","/","%","<",">","!","=","+=","-=","*=","/=","%="
        ];
        const separators = [";",",",".","(",")","{","}","[","]"];

        while (this.position < this.input.length) {
            let char = this.peek();

            // Whitespace
            if (this.isWhiteSpace(char)) {
                this.advance();
                continue;
            }

            // Comments
            if (char === "/" && this.peek(1) === "/") {
                let value = "";
                while (this.peek() !== "\n" && this.peek() !== null) {
                    value += this.peek();
                    this.advance();
                }
                tokens.push(new Token("COMMENT_SINGLE", value));
                continue;
            }
            if (char === "/" && this.peek(1) === "*") {
                let value = "";
                this.advance(); // /
                this.advance(); // *
                while (!(this.peek() === "*" && this.peek(1) === "/") && this.peek() !== null) {
                    value += this.peek();
                    this.advance();
                }
                this.advance(); // *
                this.advance(); // /
                tokens.push(new Token("COMMENT_MULTI", value));
                continue;
            }

            // Numbers (integer + float)
            if (this.isDigit(char)) {
                let value = "";
                while (this.isDigit(this.peek())) {
                    value += this.peek();
                    this.advance();
                }
                if (this.peek() === "." && this.isDigit(this.peek(1))) {
                    value += ".";
                    this.advance();
                    while (this.isDigit(this.peek())) {
                        value += this.peek();
                        this.advance();
                    }
                }
                tokens.push(new Token("NUMBER", value));
                continue;
            }

            // Strings
            if (char === '"' || char === "'" || char === "`") {
                let quoteType = char;
                let value = "";
                this.advance();
                while (this.peek() !== quoteType && this.peek() !== null) {
                    value += this.peek();
                    this.advance();
                }
                this.advance();
                tokens.push(new Token("STRING", value));
                continue;
            }

            // Identifiers / Keywords
            if (this.isLetter(char)) {
                let value = "";
                while (this.isIdentifierChar(this.peek())) {
                    value += this.peek();
                    this.advance();
                }
                if (keywords.includes(value)) {
                    tokens.push(new Token("KEYWORD", value));
                } else {
                    tokens.push(new Token("IDENTIFIER", value));
                }
                continue;
            }

            // Operators
            let opMatched = operators.find(op => {
                return this.input.startsWith(op, this.position);
            });
            if (opMatched) {
                tokens.push(new Token("OPERATOR", opMatched));
                this.position += opMatched.length;
                continue;
            }

            // Separators / Punctuation
            if (separators.includes(char)) {
                tokens.push(new Token("SEPARATOR", char));
                this.advance();
                continue;
            }

            // Unknown character
            tokens.push(new Token("UNKNOWN", char));
            this.advance();
        }

        return tokens;
    }
}