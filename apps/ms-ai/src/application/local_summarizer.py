def local_fallback_summary(text: str) -> str:
    """
    Generates a very basic local summary (extraction) for when
    HuggingFace is blocked by the ISP or there is no connection.
    """
    if len(text) < 30:
        return f"El caso reporta brevemente: {text}"
        
    # Clean and divide into phrases
    sentences = text.replace('!', '.').replace('?', '.').split('.')
    valid_sentences = [s.strip() for s in sentences if len(s.strip()) > 4]
    
    # Extract broader context for an elegant summary
    words = [w for w in valid_sentences if len(w) > 3]
    main_topic = words[0] if words else "asunto no especificado"
    
    # Find the longest sentence which usually contains the real description
    longest_sentence = max(valid_sentences, key=len) if valid_sentences else text

    return f"Tras el análisis preliminar de la denuncia, se identifica un patrón relacionado con '{main_topic.lower()}'. El denunciante reporta explícitamente: '{longest_sentence}'. Se sugiere proceder con la revisión inmediata de la evidencia y testimonios."
